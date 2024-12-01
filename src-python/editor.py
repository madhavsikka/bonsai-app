from pydantic import BaseModel

class Block(BaseModel):
    content: str
    block_id: str

class EditorContent(BaseModel):
    blocks: list[Block]
