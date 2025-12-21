import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { readContents } from './content.model.js'; // Import the plain-text content functions

const FILE_PATH = path.join('./users.txt');

// Read all users
export const readUsers = () => {
  if (!fs.existsSync(FILE_PATH)) return [];
  const lines = fs.readFileSync(FILE_PATH, 'utf-8').split('\n').filter(Boolean);
  return lines.map(line => JSON.parse(line));
};

// Write all users
export const writeUsers = (users) => {
  fs.writeFileSync(FILE_PATH, users.map(u => JSON.stringify(u)).join('\n'));
};

// Add new user
export const addUser = async (userData) => {
  const users = readUsers();

  if (userData.password) {
    const salt = await bcrypt.genSalt(12);
    userData.passwordHash = await bcrypt.hash(userData.password, salt);
    delete userData.password;
  }

  if (userData.authProvider === 'local') {
    userData.emailVerificationToken = crypto.randomBytes(32).toString('hex');
    userData.emailVerificationExpires = Date.now() + 48 * 60 * 60 * 1000; // 48 hours
  }

  userData.id = crypto.randomUUID();
  userData.savedArticles = []; // Initialize empty savedArticles
  userData.followers = [];
  userData.following = [];
  userData.pendingFollowRequests = [];
  userData.createdAt = new Date().toISOString();
  userData.updatedAt = new Date().toISOString();

  users.push(userData);
  writeUsers(users);
  return userData;
};

// Save an article for a user
export const saveArticleForUser = (userId, articleId, customName = '') => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;

  // Validate article exists
  const contents = readContents();
  const article = contents.find(c => c.id === articleId);
  if (!article) return null;

  const savedArticle = {
    rootArticle: articleId,
    lineagePathIds: [], // Optional: could track parent content IDs if needed
    customName: customName.substring(0, 100),
    savedAt: new Date().toISOString(),
  };

  users[userIndex].savedArticles.push(savedArticle);
  users[userIndex].updatedAt = new Date().toISOString();
  writeUsers(users);
  return savedArticle;
};

// Remove saved article
export const removeSavedArticleForUser = (userId, articleId) => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;

  users[userIndex].savedArticles = users[userIndex].savedArticles.filter(
    sa => sa.rootArticle !== articleId
  );
  users[userIndex].updatedAt = new Date().toISOString();
  writeUsers(users);
  return users[userIndex].savedArticles;
};

// Get all saved articles for a user with content data
export const getSavedArticlesForUs
