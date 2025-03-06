import { openDB, IDBPDatabase } from 'idb'
import { BaseDocument } from './types'

/**
 * Main class for document management and persistence in IndexedDB
 */
export class DocFlowKit {
  private db: IDBPDatabase | null = null

  /**
   * Initializes the IndexedDB database
   */
  public async initialize(): Promise<void> {
    this.db = await openDB('docFlowKitDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'docId' })
        }
      },
    })
  }

  /**
   * Creates a new document in the database
   * @param doc The document to create
   */
  public async createDocument(doc: BaseDocument): Promise<void> {
    if (!doc.docId) {
      doc.docId = crypto.randomUUID()
    }
    if (!this.db) throw new Error('DocFlowKit not initialized')
    await this.db.put('documents', doc)
  }

  /**
   * Retrieves a document by its ID
   * @param docId The document ID to retrieve
   * @returns The document or null if not found
   */
  public async getDocument(docId: string): Promise<BaseDocument | null> {
    if (!this.db) throw new Error('DocFlowKit not initialized')
    const doc = await this.db.get('documents', docId)
    return doc ?? null
  }

  /**
   * Updates an existing document
   * @param doc The document to update (must have docId)
   */
  public async updateDocument(doc: BaseDocument): Promise<void> {
    if (!this.db) throw new Error('DocFlowKit not initialized')
    if (!doc.docId) throw new Error('Document must have a docId for update')
    await this.db.put('documents', doc)
  }

  /**
   * Deletes a document by its ID
   * @param docId The ID of the document to delete
   */
  public async deleteDocument(docId: string): Promise<void> {
    if (!this.db) throw new Error('DocFlowKit not initialized')
    await this.db.delete('documents', docId)
  }

  /**
   * Lists all documents in the database
   * @returns Array of all documents
   */
  public async listDocuments(): Promise<BaseDocument[]> {
    if (!this.db) throw new Error('DocFlowKit not initialized')
    return this.db.getAll('documents')
  }
}

// Export a singleton instance for use throughout the app
export const docFlowKit = new DocFlowKit() 