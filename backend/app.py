from flask import Flask, request, jsonify, send_file, make_response, send_from_directory
from flask_cors import CORS
import fitz  # PyMuPDF
import io
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = '/tmp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_safe_font(font_name):
    if not isinstance(font_name, str):
        return "helv"
    font = font_name.lower()
    if "bold" in font and ("italic" in font or "oblique" in font):
        return "helv-bolditalic"
    elif "bold" in font:
        return "helv-bold"
    elif "italic" in font or "oblique" in font:
        return "helv-italic"
    else:
        return "helv"

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    doc = fitz.open(filepath)
    spans_data = []

    for page_num, page in enumerate(doc):
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    if span["text"].strip():
                        fontname = span.get("font", "").lower()
                        spans_data.append({
                            "page": page_num,
                            "x": span["origin"][0],
                            "y": span["origin"][1],
                            "text": span["text"],
                            "originalText": span["text"],
                            "font": span.get("font", ""),
                            "size": span["size"],
                            "color": span["color"],
                            "bbox": span["bbox"],
                            "bold": "bold" in fontname,
                            "italic": "italic" in fontname or "oblique" in fontname
                        })

    doc.close()
    return jsonify({"spans": spans_data, "filename": file.filename})

@app.route('/download', methods=['POST'])
def download_file():
    data = request.json
    spans = data.get("spans", [])
    filename = data.get("filename", "")

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.isfile(filepath):
        return jsonify({"error": "Arquivo não encontrado"}), 404

    doc = fitz.open(filepath)

    for span in spans:
        page = doc[span["page"]]
        texto_original = span.get("originalText", "")
        texto_editado = span.get("text", "")

        if texto_editado.strip() == texto_original.strip():
            continue

        rect = fitz.Rect(span["bbox"])
        page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1), overlay=True)

        fontname = get_safe_font(span.get("font", ""))
        try:
            page.insert_text(
                (span["x"], span["y"]),
                texto_editado,
                fontname=fontname,
                fontsize=span["size"],
                fill=(0, 0, 0),
                overlay=True
            )
        except Exception:
            page.insert_text(
                (span["x"], span["y"]),
                texto_editado,
                fontname="helv",
                fontsize=span["size"],
                fill=(0, 0, 0),
                overlay=True
            )

    output = io.BytesIO()
    doc.save(output)
    doc.close()
    output.seek(0)

    response = make_response(send_file(output, download_name="pdf_editado.pdf", as_attachment=True))
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response

@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/preview/<filename>')
def preview_image(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.isfile(filepath):
        return "Arquivo não encontrado", 404

    doc = fitz.open(filepath)
    page = doc[0]
    pix = page.get_pixmap(dpi=150)
    img_bytes = pix.tobytes("png")
    doc.close()
    return send_file(io.BytesIO(img_bytes), mimetype='image/png')

# Roda local e no Render (usando porta do ambiente)
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
