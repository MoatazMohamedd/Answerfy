using Smartera3S_RAG.Interfaces;
using Smartera3S_RAG.Models;
using System.Text.RegularExpressions;
using UglyToad.PdfPig;

namespace Smartera3S_RAG.Services
{
    public class RagService : IRagService
    {
        private IOllamaService _ollamaService;
        public RagService(IOllamaService ollamaService)
        {
            _ollamaService = ollamaService;
        }

        public List<string> ChunkText(string text, int chunkSize = 384, int chunkOverlap = 96)
        {
            var cleanedText = text
                .Replace("\r", " ")
                .Replace("\n", " ")
                .Replace("  ", " ")
                .Trim();

            cleanedText = Regex.Replace(cleanedText, "(?<=[a-z])(?=[A-Z])", " ");

            var chunks = new List<string>();
            var words = Regex.Split(cleanedText, @"\s+");

            int start = 0;

            while (start < words.Length)
            {
                int end = Math.Min(start + chunkSize, words.Length);
                var chunkWords = words[start..end];

                chunks.Add(string.Join(" ", chunkWords));

                start += (chunkSize - chunkOverlap);
            }

            return chunks;
        }


        public async Task<int> ProcessPdfs(List<IFormFile> files)
        {
            List<PdfChunk> chunks = new List<PdfChunk>(); 
            var pdfChunks = new List<string>();

            foreach (var file in files)
            {
                await using var stream = file.OpenReadStream();
                using var pdf = PdfDocument.Open(stream);
                foreach (var page in pdf.GetPages())
                {
                    var pageChunks = ChunkText(page.Text); 
                    int chunkIndex = 0;

                    foreach (var text in pageChunks)
                    {
                        var chunk = new PdfChunk
                        {
                            Id = chunkIndex++,
                            Source = file.FileName,
                            Text = text
                        };
                        chunks.Add(chunk);
                        pdfChunks.Add(text);
                    
                }
            }
            }

            var embeddings = await _ollamaService.CreateEmbeddings(pdfChunks);
            QdrantService service = new QdrantService();
           await service.StoreEmbeddings(embeddings, chunks);
            return pdfChunks.Count;
        }
    }
}
