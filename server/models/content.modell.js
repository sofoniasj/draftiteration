import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// File to store content data
const FILE_PATH = path.join('./content.txt');

// Utility: read all content
export const readContents = () => {
  if (!fs.existsSync(FILE_PATH)) return [];
  const lines = fs.readFileSync(FILE_PATH, 'utf-8').split('\n').filter(Boolean);
  return lines.map(line => JSON.parse(line));
};

// Utility: write all content (overwrite)
export const writeContents = (contents) => {
  fs.writeFileSync(FILE_PATH, contents.map(c => JSON.stringify(c)).join('\n'));
};

// Add a new content
export const addContent = (contentData) => {
  const contents = readContents();
  contentData.id = crypto.randomUUID();
  contentData.likes = [];
  contentData.likeCount = 0;
  contentData.reports = [];
  contentData.isReported = false;
  contentData.createdAt = new Date().toISOString();
  contentData.updatedAt = new Date().toISOString();
  contentData.parentContent = contentData.parentContent || null;
  contentData.isPrivateToFollowers = contentData.isPrivateToFollowers || false;

  contents.push(contentData);
  writeContents(contents);
  return contentData;
};

// Update content by id
export const updateContent = (id, updates) => {
  const contents = readContents();
  const index = contents.findIndex(c => c.id === id);
  if (index === -1) return null;

  contents[index] = { ...contents[index], ...updates, updatedAt: new Date().toISOString() };

  // Update likeCount if likes changed
  if (updates.likes) {
    contents[index].likeCount = updates.likes.length;
  }

  // Update isReported if reports changed
  if (updates.reports) {
    contents[index].isReported = updates.reports.length > 0;
  }

  writeContents(contents);
  return contents[index];
};

// Add a like to content
export const likeContent = (id, userId) => {
  const contents = readContents();
  const content = contents.find(c => c.id === id);
  if (!content) return null;

  if (!content.likes.includes(userId)) {
    content.likes.push(userId);
    content.likeCount = content.likes.length;
    content.updatedAt = new Date().toISOString();
    writeContents(contents);
  }
  return content;
};

// Add a report to content
export const reportContent = (id, report) => {
  const contents = readContents();
  const content = contents.find(c => c.id === id);
  if (!content) return null;

  content.reports.push({
    reporter: report.reporter,
    reason: report.reason || '',
    reportedAt: new Date().toISOString(),
  });
  content.isReported = content.reports.length > 0;
  content.updatedAt = new Date().toISOString();

  writeContents(contents);
  return content;
};

// Fetch content by author
export const getContentsByAuthor = (authorId) => {
  const contents = readContents();
  return contents.filter(c => c.author === authorId);
};
