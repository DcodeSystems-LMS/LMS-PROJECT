export interface Bookmark {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  lessonId: string;
  instructor: string;
  bookmarkedAt: string;
  progress: number;
  lessonDuration: string;
  thumbnailUrl?: string;
}

class BookmarkService {
  private storageKey = 'studentBookmarks';

  // Get all bookmarks from localStorage
  getBookmarks(): Bookmark[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  // Save bookmarks to localStorage
  private saveBookmarks(bookmarks: Bookmark[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  // Add a new bookmark
  addBookmark(bookmarkData: Omit<Bookmark, 'id' | 'bookmarkedAt'>): Bookmark {
    const bookmarks = this.getBookmarks();
    
    // Check if bookmark already exists
    const existingBookmark = bookmarks.find(
      b => b.courseId === bookmarkData.courseId && b.lessonId === bookmarkData.lessonId
    );
    
    if (existingBookmark) {
      return existingBookmark;
    }

    const newBookmark: Bookmark = {
      ...bookmarkData,
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookmarkedAt: new Date().toISOString()
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    this.saveBookmarks(updatedBookmarks);
    
    return newBookmark;
  }

  // Remove a bookmark
  removeBookmark(bookmarkId: string): boolean {
    const bookmarks = this.getBookmarks();
    const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
    
    if (updatedBookmarks.length !== bookmarks.length) {
      this.saveBookmarks(updatedBookmarks);
      return true;
    }
    
    return false;
  }

  // Remove bookmark by course and lesson ID
  removeBookmarkByLesson(courseId: string, lessonId: string): boolean {
    const bookmarks = this.getBookmarks();
    const updatedBookmarks = bookmarks.filter(
      b => !(b.courseId === courseId && b.lessonId === lessonId)
    );
    
    if (updatedBookmarks.length !== bookmarks.length) {
      this.saveBookmarks(updatedBookmarks);
      return true;
    }
    
    return false;
  }

  // Check if a lesson is bookmarked
  isBookmarked(courseId: string, lessonId: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.courseId === courseId && b.lessonId === lessonId);
  }

  // Get bookmark by course and lesson ID
  getBookmarkByLesson(courseId: string, lessonId: string): Bookmark | null {
    const bookmarks = this.getBookmarks();
    return bookmarks.find(b => b.courseId === courseId && b.lessonId === lessonId) || null;
  }

  // Update bookmark progress
  updateBookmarkProgress(bookmarkId: string, progress: number): boolean {
    const bookmarks = this.getBookmarks();
    const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmarkId);
    
    if (bookmarkIndex !== -1) {
      bookmarks[bookmarkIndex].progress = progress;
      this.saveBookmarks(bookmarks);
      return true;
    }
    
    return false;
  }

  // Clear all bookmarks
  clearAllBookmarks(): void {
    this.saveBookmarks([]);
  }
}

// Export singleton instance
export const bookmarkService = new BookmarkService();
