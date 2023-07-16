import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// A function that assigns a shadow style to an element
function setBoxShadow(el, shadowStyle) {
  el.style.boxShadow = shadowStyle;
}

const PdfDownloader = ({rootElementId , downloadFileName}) => {

    const downloadBtnID = "download-btn"

    const downloadPdfDocument = () => {
        const element = document.getElementById(rootElementId);

        const onclone = (_, element) => {
            const downloadBtn = element.querySelector(`#${downloadBtnID}`)
            downloadBtn.style.display = 'none'
            setBoxShadow(element, 'none')
        }

        html2canvas(element, { onclone })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');

                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "pt",
                    format: [canvas.width, canvas.height]
                });

                pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${downloadFileName}.pdf`);
            })
    }

    return (
        <div className="btn-wrapper" id={downloadBtnID}>
           <button className="pdf-btn" onClick={downloadPdfDocument}>Download Pdf</button>
        </div>
    )

}

export default PdfDownloader;