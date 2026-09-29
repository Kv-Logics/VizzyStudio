from pydantic import BaseModel, Field
from typing import List, Optional, Literal

CameraAngle = Literal[
    'Cinematic Wide',
    'Dramatic Close-Up',
    'Over-The-Shoulder',
    'Low Angle Hero',
    'Bird\'s Eye View',
    'Dutch Angle Tilted'
]

VisualStyle = Literal[
    'WW2 Sepia Ink',
    'Gritty Noir',
    'Vibrant Anime',
    'Cyberpunk Neon',
    'Dark Fantasy Watercolors',
    'Classic 1950s Comic Book'
]

class TextElement(BaseModel):
    id: str
    type: Literal['speech', 'thought', 'caption', 'soundfx']
    content: str
    speaker: Optional[str] = None
    position_x: float = Field(default=15.0, description="X coordinate percentage 0-100")
    position_y: float = Field(default=15.0, description="Y coordinate percentage 0-100")

class PanelOption(BaseModel):
    id: str
    image_url: str
    seed: int
    prompt: str
    camera_angle: CameraAngle
    lighting_tone: str
    description: str

class StoryPanel(BaseModel):
    id: str
    page_number: int
    panel_number: int
    title: str
    description: str
    camera_angle: CameraAngle
    selected_option: PanelOption
    text_elements: List[TextElement] = []
    filter_effect: Optional[str] = 'none'
    sound_effect_cue: Optional[str] = 'boom'

class ColorPalette(BaseModel):
    primary: str = '#1c1917'
    secondary: str = '#78350f'
    accent: str = '#dc2626'
    background: str = '#fef3c7'

class StoryMetadata(BaseModel):
    id: str
    title: str
    genre: str
    visual_style: VisualStyle
    color_palette: ColorPalette
    synopsis: str
    character_notes: str
    author: str = 'User'

class GenerateOptionsRequest(BaseModel):
    prompt: str
    visual_style: VisualStyle
    camera_angle: CameraAngle = 'Cinematic Wide'
    panel_number: int = 1

class ChatMessageRequest(BaseModel):
    user_message: str
    story_id: str
