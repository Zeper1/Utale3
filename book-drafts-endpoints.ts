// -----------------------------------------------------------------
// Endpoints para borradores de libros (book drafts)
// -----------------------------------------------------------------

// Obtener todos los borradores de un usuario
app.get("/api/book-drafts", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    }
    
    const userId = req.user.id;
    const drafts = await storage.getUserBookDrafts(userId);
    res.json(drafts);
  } catch (error) {
    serverLogger.error(`Error en endpoint GET /api/book-drafts: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: "Error al obtener los borradores" });
  }
});

// Obtener un borrador específico
app.get("/api/book-drafts/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    }
    
    const userId = req.user.id;
    const draftId = parseInt(req.params.id);
    
    if (isNaN(draftId)) {
      return res.status(400).json({ error: "ID de borrador inválido" });
    }
    
    const draft = await storage.getBookDraft(draftId);
    
    if (!draft) {
      return res.status(404).json({ error: "Borrador no encontrado" });
    }
    
    // Verificar que el borrador pertenece al usuario
    if (draft.userId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para acceder a este borrador" });
    }
    
    res.json(draft);
  } catch (error) {
    serverLogger.error(`Error en endpoint GET /api/book-drafts/:id: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: "Error al obtener el borrador" });
  }
});

// Guardar o actualizar un borrador
app.post("/api/book-drafts", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    }
    
    const userId = req.user.id;
    const draftData = req.body;
    
    // Asegurar que el userId del borrador es el del usuario autenticado
    draftData.userId = userId;
    
    // Guardar el borrador
    const draft = await storage.saveBookDraft(draftData);
    
    res.json(draft);
  } catch (error) {
    serverLogger.error(`Error en endpoint POST /api/book-drafts: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: "Error al guardar el borrador" });
  }
});

// Actualizar un borrador existente
app.put("/api/book-drafts/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    }
    
    const userId = req.user.id;
    const draftId = parseInt(req.params.id);
    const draftData = req.body;
    
    if (isNaN(draftId)) {
      return res.status(400).json({ error: "ID de borrador inválido" });
    }
    
    const existingDraft = await storage.getBookDraft(draftId);
    
    if (!existingDraft) {
      return res.status(404).json({ error: "Borrador no encontrado" });
    }
    
    // Verificar que el borrador pertenece al usuario
    if (existingDraft.userId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para modificar este borrador" });
    }
    
    // Actualizar el borrador
    const updatedDraft = await storage.updateBookDraft(draftId, draftData);
    
    res.json(updatedDraft);
  } catch (error) {
    serverLogger.error(`Error en endpoint PUT /api/book-drafts/:id: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: "Error al actualizar el borrador" });
  }
});

// Eliminar un borrador
app.delete("/api/book-drafts/:id", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    }
    
    const userId = req.user.id;
    const draftId = parseInt(req.params.id);
    
    if (isNaN(draftId)) {
      return res.status(400).json({ error: "ID de borrador inválido" });
    }
    
    const draft = await storage.getBookDraft(draftId);
    
    if (!draft) {
      return res.status(404).json({ error: "Borrador no encontrado" });
    }
    
    // Verificar que el borrador pertenece al usuario
    if (draft.userId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este borrador" });
    }
    
    const deleted = await storage.deleteBookDraft(draftId);
    
    if (deleted) {
      res.status(200).json({ success: true, message: "Borrador eliminado con éxito" });
    } else {
      res.status(500).json({ error: "No se pudo eliminar el borrador" });
    }
  } catch (error) {
    serverLogger.error(`Error en endpoint DELETE /api/book-drafts/:id: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: "Error al eliminar el borrador" });
  }
});