using Smartera3S_RAG.Models;

namespace Smartera3S_RAG.Interfaces
{
    public interface IQdrantService
    {
        Task StoreEmbeddings(List<float[]> embeddings, List<PdfChunk> chunks);
        Task<List<PdfChunk>> QueryDatabase(float[] userQuery);
    }
}
