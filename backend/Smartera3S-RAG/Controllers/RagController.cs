using Microsoft.AspNetCore.Mvc;
using Smartera3S_RAG.Interfaces;

namespace Smartera3S_RAG.Controllers
{
    [ApiController]
    [Route("api")]
    public class RagController : ControllerBase
    {
        private IOllamaService _ollamaService;
        private IRagService _ragService;

        public RagController(IOllamaService ollamaService, IRagService ragService) {
            _ollamaService = ollamaService;
            _ragService = ragService;
        }


        [HttpPost("pdfs/upload")]
        public async Task<IActionResult> UploadPdfs([FromForm] List<IFormFile> files) 
        {
            var result = await _ragService.ProcessPdfs(files);
            return Ok($"Adding {result} documents successful!");
        }

        [HttpGet("chat")]
        public async Task<IActionResult> Generate(string userQuery)
        {
            var result = await _ollamaService.GenerateResponse(userQuery);
            return Ok(result);            
        }
    }
}
