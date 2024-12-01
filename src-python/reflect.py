from typing import Annotated, Union
from typing_extensions import TypedDict
from langchain_ollama.llms import OllamaLLM
from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from editor import EditorContent
from pydantic import BaseModel
from langchain_core.tools import tool

class ReflectRequest(BaseModel):
    editor_content: EditorContent
    prompt: str

class ReflectResponse(BaseModel):
    updated_editor_content: EditorContent

# Define the state type to include editor content
class State(TypedDict):
    messages: Annotated[list, add_messages]
    editor_content: EditorContent  # Add editor content to state


@tool(parse_docstring=True)
def update_block(block_id: str, content: str):
    """
    Update a block in the editor.

    Args:
        block_id: The ID of the block to update.
        content: The new content for the block.
    """
    return {"block_id": block_id, "content": content}


graph_builder = StateGraph(State)
llm = OllamaLLM(model="llama3.2:3b")
llm_with_tools = llm.bind_tools([update_block])

def reflect(state: State):
    messages = state["messages"]
    editor = state["editor_content"]
    
    # Format all blocks into context
    blocks_context = "\n".join([
        f"Block {block.block_id}:\n{block.content}"
        for block in editor.blocks
    ])
    
    # Add editor context to the messages
    context_message = f"Current editor blocks:\n{blocks_context}"
    messages.append(("system", context_message))
    
    # Get LLM response
    response = llm_with_tools.invoke(messages)
    
    # TODO: Parse LLM response to identify which blocks need updates
    # For now, returning original blocks
    return {
        "messages": [response],
        "editor_content": EditorContent(blocks=editor.blocks)
    }


# Add the reflection node
graph_builder.add_node("reflect", reflect)

# Set entry and finish points
graph_builder.set_entry_point("reflect")
graph_builder.set_finish_point("reflect")

# Compile the graph
graph = graph_builder.compile()

def process_reflection_request(request: ReflectRequest) -> ReflectResponse:
    # Configure the conversation thread
    config = {"configurable": {"thread_id": "1"}}
    
    # Initialize state with editor content (now using blocks)
    initial_state = {
        "messages": [("user", request.prompt)],
        "editor_content": request.editor_content  # EditorContent with blocks
    }
    
    # Run the graph
    result = graph.invoke(initial_state, config)
    
    # Return the response with updated editor content
    return ReflectResponse(
        updated_editor_content=result["editor_content"]
    )
