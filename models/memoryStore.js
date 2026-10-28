const mongoose = require('mongoose');

// In-Memory Database Collections (Used when MongoDB is offline / unreachable)
const users = [];
const posts = [];

class QueryChain {
  constructor(data) {
    this.data = data;
  }

  populate(field, select) {
    if (Array.isArray(this.data)) {
      this.data = this.data.map((item) => this._populateItem(item, field));
    } else if (this.data) {
      this.data = this._populateItem(this.data, field);
    }
    return this;
  }

  _populateItem(item, field) {
    if (field === 'createdBy' && item.createdBy) {
      const creator = users.find(
        (u) => u._id.toString() === item.createdBy.toString()
      );
      if (creator) {
        return {
          ...item,
          createdBy: {
            _id: creator._id,
            name: creator.name,
            email: creator.email,
            role: creator.role,
          },
        };
      }
    }
    return item;
  }

  sort(sortCriteria) {
    if (Array.isArray(this.data)) {
      this.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return this;
  }

  select(fields) {
    if (this.data && fields.includes('-password')) {
      const copy = { ...this.data };
      delete copy.password;
      return copy;
    }
    return this.data;
  }

  then(resolve, reject) {
    return Promise.resolve(this.data).then(resolve, reject);
  }
}

// Memory Post Document Wrapper with .save() method
function createPostDoc(postData) {
  const doc = {
    _id: postData._id || new mongoose.Types.ObjectId(),
    title: postData.title,
    description: postData.description,
    content: postData.content,
    image: postData.image || '',
    category: postData.category || 'General',
    createdBy: postData.createdBy,
    status: postData.status || 'draft',
    createdAt: postData.createdAt || new Date(),
  };

  doc.save = async function () {
    const idx = posts.findIndex((p) => p._id.toString() === doc._id.toString());
    if (idx !== -1) {
      posts[idx] = { ...doc };
    } else {
      posts.push(doc);
    }
    return doc;
  };

  return doc;
}

// Memory User Model
const MemoryUser = {
  async findOne(filter) {
    if (filter.email) {
      const user = users.find(
        (u) => u.email.toLowerCase() === filter.email.toLowerCase()
      );
      return user ? { ...user } : null;
    }
    return null;
  },

  findById(id) {
    const user = users.find((u) => u._id.toString() === id.toString());
    return new QueryChain(user ? { ...user } : null);
  },

  async create(userData) {
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || 'user',
      createdAt: new Date(),
    };
    users.push(newUser);
    return { ...newUser };
  },
};

// Memory Post Model
const MemoryPost = {
  async create(postData) {
    const doc = createPostDoc(postData);
    posts.push(doc);
    return doc;
  },

  find(filter = {}) {
    let results = [...posts];

    if (filter.status) {
      results = results.filter((p) => p.status === filter.status);
    }

    if (filter.createdBy) {
      results = results.filter(
        (p) => p.createdBy.toString() === filter.createdBy.toString()
      );
    }

    return new QueryChain(results.map((p) => createPostDoc(p)));
  },

  findOne(filter = {}) {
    let result = null;
    if (filter._id && filter.status) {
      result = posts.find(
        (p) =>
          p._id.toString() === filter._id.toString() &&
          p.status === filter.status
      );
    } else if (filter._id) {
      result = posts.find((p) => p._id.toString() === filter._id.toString());
    }
    return new QueryChain(result ? createPostDoc(result) : null);
  },

  async findById(id) {
    const post = posts.find((p) => p._id.toString() === id.toString());
    return post ? createPostDoc(post) : null;
  },

  async findByIdAndDelete(id) {
    const idx = posts.findIndex((p) => p._id.toString() === id.toString());
    if (idx !== -1) {
      return posts.splice(idx, 1)[0];
    }
    return null;
  },
};

module.exports = {
  MemoryUser,
  MemoryPost,
};

