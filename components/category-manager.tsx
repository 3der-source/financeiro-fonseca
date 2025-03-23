"use client"

import { useState } from "react"
import { PlusIcon, Trash2Icon, X } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCategories, type Category } from "@/hooks/use-categories"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CategoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryManager({ open, onOpenChange }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim())
      setNewCategoryName("")
    }
  }

  const handleUpdateCategory = (id: string, name: string) => {
    if (name.trim()) {
      updateCategory(id, { name: name.trim() })
      setEditingCategory(null)
    }
  }

  const handleColorChange = (id: string, color: string) => {
    updateCategory(id, { color })
  }

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteCategory(id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>Adicione, edite ou remova categorias para organizar suas transações.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Nova categoria"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <Button onClick={handleAddCategory} size="icon">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2 p-2 rounded-md border">
                <div
                  className="h-6 w-6 rounded-full cursor-pointer"
                  style={{ backgroundColor: category.color }}
                  onClick={() => {
                    const newColor = window.prompt("Insira um código de cor hexadecimal (ex: #FF0000)", category.color)
                    if (newColor) {
                      handleColorChange(category.id, newColor)
                    }
                  }}
                />

                {editingCategory?.id === category.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory(category.id, editingCategory.name)}
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" onClick={() => setEditingCategory(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleUpdateCategory(category.id, editingCategory.name)}
                    >
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 cursor-pointer" onClick={() => setEditingCategory(category)}>
                      {category.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

