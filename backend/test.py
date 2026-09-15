import certifi
from pymongo import MongoClient

uri = "mongodb+srv://femina-pulse-user:Meghav7925@cluster0.6i8x9wq.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(
    uri,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000
)

try:
    print(client.admin.command("ping"))
    print("MongoDB connected successfully!")
except Exception as e:
    print("MongoDB connection failed:")
    print(e)