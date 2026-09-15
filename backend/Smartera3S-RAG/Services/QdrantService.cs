using Qdrant.Client;
using Qdrant.Client.Grpc;
using Smartera3S_RAG.Interfaces;
using Smartera3S_RAG.Models;
using System;
using System.Net.Http;

namespace Smartera3S_RAG.Services
{

    public class QdrantService : IQdrantService
    {
        QdrantClient client;

        public QdrantService()
        {
            client = new QdrantClient("localhost");
        }
        public async Task<List<PdfChunk>> QueryDatabase(float[] userQuery)
        {
            var pointsResult = await client.SearchAsync("my_collection", userQuery, limit: 5);
            List<PdfChunk> responseChunks = new List<PdfChunk>();

            foreach (var point in pointsResult)
            {
                PdfChunk chunk = new PdfChunk();
                chunk.Id = (int) point.Payload["chunk_index"].IntegerValue;
                chunk.Source = point.Payload["source"].StringValue;
                chunk.Text = point.Payload["chunk"].StringValue;
                responseChunks.Add(chunk);
            }
            return responseChunks;
        }

        public async Task StoreEmbeddings(List<float[]> embeddings, List<PdfChunk> chunks)
        {
            if (!await client.CollectionExistsAsync("my_collection"))
            {
                await client.CreateCollectionAsync("my_collection",
            new VectorParams { Size = (ulong)embeddings[0].Length, Distance = Distance.Cosine });
            }
                var points = embeddings.Select((vec, i) => new PointStruct
                {
                    Id = (ulong)(i + 1),
                    Vectors = vec,
                    Payload = {
                        ["chunk_index"] = chunks[i].Id,
                        ["chunk"] = chunks[i].Text,
                        ["source"] = chunks[i].Source,
                    }
                }).ToList();
                var updateResult = await client.UpsertAsync("my_collection", points);
        }
    }
}
