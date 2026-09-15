namespace Smartera3S_RAG.Interfaces
{
    public interface IRagService
    {
        Task<int> ProcessPdfs(List<IFormFile> files);
        
    }
}
