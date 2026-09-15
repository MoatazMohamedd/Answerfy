using OllamaSharp.Models;

namespace Smartera3S_RAG.Interfaces
{
    public interface IOllamaService
    {
        Task<string> GenerateResponse(string userQuery);
        Task<List<float[]>> CreateEmbeddings(List<string> chunks);
    }
}
