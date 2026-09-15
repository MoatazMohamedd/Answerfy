using OllamaSharp;
using OllamaSharp.Models;
using OllamaSharp.Models.Chat;
using Smartera3S_RAG.Interfaces;
using System.Text;

namespace Smartera3S_RAG.Services
{
    public class OllamaService: IOllamaService
    {
        Uri uri;
        OllamaApiClient ollamaApi;
        IQdrantService _qdrantService;

        public OllamaService(IQdrantService qdrantService)
        {
            uri = new Uri("http://localhost:11434");
            ollamaApi = new OllamaApiClient(uri);
            _qdrantService = qdrantService;
        }

        public async Task<List<float[]>> CreateEmbeddings(List<string> input)
        {
            EmbedRequest request = new EmbedRequest();
            request.Model = "nomic-embed-text:v1.5";
            request.Input = input;

            var response = await ollamaApi.EmbedAsync(request);
          
            return response.Embeddings;
        }

        public async Task<string> GenerateResponse(string userQuery)
        {
            var userQueryVector = await CreateEmbeddings([userQuery]);
            var vectorDbChunks = await _qdrantService.QueryDatabase(userQueryVector[0]);
            ollamaApi.SelectedModel = "llama3.2:1b";

            StringBuilder prompt = new StringBuilder();
            prompt.AppendLine("You are a helpful AI assistant.");
            prompt.AppendLine("Use ONLY the information in the CONTEXT below to answer");
            prompt.AppendLine("If the answer is not in the context, reply:");
            prompt.AppendLine("\"I don’t know based on the provided documents.\"");
            prompt.AppendLine();
            prompt.AppendLine("CONTEXT:");

            foreach (var chunk in vectorDbChunks)
            {
                prompt.AppendLine($"--- Chunk #{chunk.Id} ---");
                prompt.AppendLine(chunk.Text);
                prompt.AppendLine();
            }
            prompt.AppendLine("END OF CONTEXT");
            prompt.AppendLine();
            prompt.AppendLine($"USER QUESTION: {userQuery}");
            prompt.AppendLine("ANSWER:");

            GenerateRequest request = new GenerateRequest();
            request.Prompt = prompt.ToString();
            var response =  ollamaApi.GenerateAsync(request);

            StringBuilder fullResponse = new StringBuilder();

           await foreach(var stream in response)
            {
                fullResponse.Append(stream?.Response);
            }

            fullResponse.AppendLine();
            fullResponse.AppendLine();
            fullResponse.AppendLine("Sources:");

            foreach (var chunk in vectorDbChunks
                     .Select(c => $"{c.Source}")
                     .Distinct())
            {
                fullResponse.AppendLine($"- {chunk}");
            }

            return fullResponse.ToString();
        }
    }
}
