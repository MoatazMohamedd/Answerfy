using System.ComponentModel.DataAnnotations;

namespace Smartera3S_RAG.Models
{
    public class PdfChunk
    {
        public int Id { get; set; }


        public string Source { get; set; } = "";
        public string Text { get; set; } = "";
    }
}
