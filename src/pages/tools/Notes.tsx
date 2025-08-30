import { useState, useEffect } from "react";
import { StickyNote, Plus, Trash2, Edit3, Search, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const { toast } = useToast();

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("productivity-notes");
    if (saved) {
      const loadedNotes = JSON.parse(saved);
      setNotes(loadedNotes);
      if (loadedNotes.length > 0) {
        setSelectedNote(loadedNotes[0]);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("productivity-notes", JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [note, ...prev]);
    setSelectedNote(note);
    setIsEditing(true);
    setNewTitle(note.title);
    setNewContent(note.content);
    setNewTags("");
  };

  const saveNote = () => {
    if (!selectedNote) return;

    const updatedNote = {
      ...selectedNote,
      title: newTitle || "Untitled",
      content: newContent,
      tags: newTags ? newTags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ));
    
    setSelectedNote(updatedNote);
    setIsEditing(false);
    
    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully.",
    });
  };

  const deleteNote = (noteToDelete: Note) => {
    setNotes(prev => prev.filter(note => note.id !== noteToDelete.id));
    
    if (selectedNote?.id === noteToDelete.id) {
      const remainingNotes = notes.filter(note => note.id !== noteToDelete.id);
      setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
    }
    
    toast({
      title: "Note Deleted",
      description: `"${noteToDelete.title}" has been deleted.`,
    });
  };

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setNewTitle(note.title);
    setNewContent(note.content);
    setNewTags(note.tags.join(", "));
    setIsEditing(true);
  };

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <StickyNote className="h-8 w-8 text-primary" />
          Notes
        </div>
        <p className="text-muted-foreground">Capture your thoughts and ideas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Notes List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">All Notes</CardTitle>
              <Button size="sm" onClick={createNote}>
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? "No notes match your search." : "No notes yet. Create your first note!"}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedNote?.id === note.id 
                      ? "border-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{note.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {note.content || "No content"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{note.tags.length - 2} more
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note);
                      }}
                      className="ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Note Editor */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedNote ? (isEditing ? "Edit Note" : "View Note") : "Select a Note"}
              </CardTitle>
              {selectedNote && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveNote}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => startEditing(selectedNote)}>
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {!selectedNote ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a note to view or create a new one
              </div>
            ) : isEditing ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <Input
                  placeholder="Note title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Input
                  placeholder="Tags (comma separated)..."
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
                <Textarea
                  placeholder="Write your note content here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="flex-1 min-h-[300px] resize-none"
                />
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(selectedNote.createdAt).toLocaleDateString()} • 
                    Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                {selectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedNote.content || (
                      <span className="text-muted-foreground italic">
                        This note is empty. Click Edit to add content.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}