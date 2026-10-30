import D from "node:crypto";
import p, { Schema as H, model as I } from "mongoose";
import { availableParallelism as P } from "node:os";
import N from "express-session";
import U from "connect-mongo";
import K from "express-rate-limit";
import C from "bcryptjs";
const M = (function() {
  let r, s;
  function f(l) {
    const o = Buffer.from(l, "hex");
    if (!/^[0-9a-fA-F]{64}$/.test(l) || o.length !== 32)
      throw new Error(
        "Encryption key must be a 64-character hexadecimal string (32 bytes)."
      );
    return o;
  }
  function m(l) {
    r = l;
  }
  function y(l) {
    s = f(l);
  }
  function w() {
    return s?.length === 32;
  }
  function $(l) {
    if (l == null) return l;
    const o = typeof l == "string" ? l : String(l);
    if (!w() || !s)
      throw new Error("Encryption key must be configured before encrypting data.");
    const i = D.randomBytes(12), n = D.createCipheriv(r, s, i);
    let u = n.update(o, "utf8", "hex");
    u += n.final("hex");
    const S = n.getAuthTag().toString("hex");
    return `${i.toString("hex")}:${S}:${u}`;
  }
  function v(l) {
    if (!w() || !s)
      throw new Error("Encryption key must be configured before decrypting data.");
    const [o, i, n] = l.split(":");
    if (!o || !i || !n)
      throw new Error("Invalid encrypted text format.");
    const u = Buffer.from(o, "hex"), S = Buffer.from(i, "hex"), O = D.createDecipheriv(r, s, u);
    O.setAuthTag(S);
    let h = O.update(n, "hex", "utf8");
    return h += O.final("utf8"), h;
  }
  function A(l) {
    if (typeof l != "string") return !1;
    const o = l.split(":");
    return o.length === 3 && o[0].length === 24 && o[1].length === 32;
  }
  return m("aes-256-gcm"), {
    encrypt: $,
    decrypt: v,
    isConfigured: w,
    isEncrypted: A,
    setEncryptionAlgorithm: m,
    setEncryptionKey: y
  };
})(), X = async () => {
  await p.disconnect(), console.log("MongoDB disconnected successfully.");
}, F = async (r, s = {}) => {
  if (!r) throw new Error("Mongo db url is not defined");
  p.set("strictQuery", !0), await p.connect(r, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 1e4,
    socketTimeoutMS: 45e3,
    heartbeatFrequencyMS: 2e3,
    retryWrites: !0,
    ...s
  }), console.log("MongoDB connected successfully");
}, V = P();
function q(r = !1, s = 1) {
  if (!r) return 1;
  const f = Number.isInteger(s) && s > 0 ? s : 1;
  return Math.min(f, Math.max(V, 1));
}
const ee = { ObjectId: p.Schema.Types.ObjectId, Decimal128: p.Schema.Types.Decimal128 }, te = p.isValidObjectId, ne = async (r, s) => p.connection.transaction(r, s), re = () => p.connection.readyState, L = async (r, s = {}, f = !1) => {
  if (!p.connection.db) throw new Error("MongoDB is not connected.");
  return f ? p.connection.db.admin().command(r, s) : p.connection.db.command(r, s);
}, oe = (r) => {
  if (!p.connection.db) throw new Error("MongoDB is not connected.");
  return p.connection.db.collection(r);
}, se = p.mongo.MongoClient, ae = p.Types.ObjectId, ie = () => {
  if (!p.connection.db) throw new Error("MongoDB is not connected.");
  return p.connection.db;
}, ce = (r, s = {}) => L(r, s, !0), ue = (r) => function(s, f, m) {
  const y = s.headers.origin;
  if (y && r.includes(y) && (f.setHeader("Access-Control-Allow-Origin", y), f.setHeader("Access-Control-Allow-Credentials", "true")), f.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  ), f.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  ), s.method === "OPTIONS") {
    f.sendStatus(204);
    return;
  }
  m();
};
function fe(r, s, f, m, y = {}) {
  const w = p.connection.getClient(), $ = m ? { mongoUrl: m } : w ? { client: w } : (() => {
    throw new Error(
      "MongoDB session store requires a connected Mongoose client or a mongoUrl."
    );
  })(), v = U.create({
    ...$,
    dbName: f,
    touchAfter: 24 * 3600,
    crypto: { secret: r }
  }), { cookie: A, ...l } = y;
  return N({
    secret: r,
    resave: !1,
    saveUninitialized: !1,
    rolling: !0,
    ...l,
    store: v,
    cookie: {
      secure: s === "production",
      httpOnly: !0,
      sameSite: "lax",
      maxAge: 1e3 * 60 * 60 * 24,
      ...A
    }
  });
}
const le = (r = {}) => K({
  windowMs: 900 * 1e3,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: !1,
  ...r
});
function de(r, s, f) {
  return r.session.userId ? f() : s.status(401).json({
    authenticated: !1,
    error: "No autorizado"
  });
}
const R = (r, s, f = [], m = [], y = {}) => {
  if (f.length > 0 && !M.isConfigured())
    throw new Error(
      "OwlCrypto.setEncryptionKey must be called before creating a model with encrypted fields."
    );
  const w = new H(s, {
    timestamps: y.timestamps ?? !0
  });
  function $(e) {
    e && f.forEach((t) => {
      if (e[t] && M.isEncrypted(e[t]))
        try {
          e[t] = M.decrypt(e[t]);
        } catch (a) {
          const d = a instanceof Error ? a.message : String(a);
          console.error(`Error decrypting field ${t}:`, d);
        }
    });
  }
  function v(e) {
    return typeof e != "string" ? !1 : /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(e);
  }
  function A(e) {
    const t = e.split(".");
    if (t.length === 1) return e;
    let a = null;
    for (let d = t.length - 1; d >= 0; d--)
      d === t.length - 1 ? a = { path: t[d] } : a = { path: t[d], populate: a };
    return a || e;
  }
  function l(e, t, a) {
    e.pre("save", async function(d) {
      t.forEach((c) => {
        this.isModified(c) && this[c] && !M.isEncrypted(this[c]) && (this[c] = M.encrypt(this[c]));
      });
      for (const c of a)
        if (this.isModified(c) && this[c] && !v(this[c])) {
          const g = await C.genSalt(y.bcryptSaltRounds ?? 10);
          this[c] = await C.hash(this[c], g);
        }
      d();
    }), e.pre(
      ["findOneAndUpdate", "updateOne", "updateMany"],
      async function(d) {
        const c = this.getUpdate();
        if (!c) return d();
        t.forEach((g) => {
          const b = c[g] || c.$set && c.$set[g];
          if (b && typeof b == "string" && !M.isEncrypted(b)) {
            const j = M.encrypt(b);
            c[g] && (c[g] = j), c.$set && c.$set[g] && (c.$set[g] = j);
          }
        });
        for (const g of a) {
          const b = c[g] || c.$set && c.$set[g];
          if (b && typeof b == "string" && !v(b)) {
            const j = await C.genSalt(y.bcryptSaltRounds ?? 10), k = await C.hash(b, j);
            c[g] && (c[g] = k), c.$set && c.$set[g] && (c.$set[g] = k);
          }
        }
        d();
      }
    ), e.post(["find", "findOne", "findOneAndUpdate"], function(d) {
      d && (Array.isArray(d) ? d.forEach($) : $(d));
    }), e.set("toJSON", {
      transform: (d, c) => (t.forEach((g) => delete c[g]), a.forEach((g) => delete c[g]), c)
    });
  }
  function o(e, t) {
    return t && (Array.isArray(t) ? t.forEach((a) => {
      typeof a == "string" && a.includes(".") ? e = e.populate(A(a)) : e = e.populate(a);
    }) : typeof t == "string" && t.includes(".") ? e = e.populate(A(t)) : e = e.populate(t)), e;
  }
  function i(e, t) {
    if (t.page && t.pageSize) {
      const a = (t.page - 1) * t.pageSize;
      e = e.skip(a).limit(t.pageSize);
    } else t.skip !== void 0 && t.limit ? e = e.skip(t.skip).limit(t.limit) : t.limit && (e = e.limit(t.limit));
    return e;
  }
  (f.length > 0 || m.length > 0) && l(w, f, m);
  for (const e of y.indexes ?? []) w.index(e.fields, e.options);
  const n = p.models[r] ?? I(r, w);
  function u(e, t) {
    return t.populate && (e = o(e, t.populate)), t.select && (e = e.select(t.select)), t.sort && (e = e.sort(t.sort)), t.session && (e = e.session(t.session)), t.lean && (e = e.lean()), i(e, t);
  }
  const S = async (e, t, a) => {
    if (!m.includes(t))
      throw new Error(
        `The field '${t}' is not registered in the hashedFields of this model.`
      );
    const d = await n.findById(e).select(`+${t}`).lean();
    return !d || !d[t] ? !1 : await C.compare(a, d[t]);
  }, O = async (e = {}) => {
    let t = n.find();
    return await u(t, e);
  }, h = async (e, t = {}) => {
    let a = n.findById(e);
    return await u(a, t);
  }, E = async (e = {}, t = {}) => {
    let a = n.findOne(e);
    return await u(a, t);
  }, T = async (e = {}, t = {}) => {
    let a = n.find(e);
    return await u(a, t);
  }, B = async (e) => await n.findByIdAndDelete(e), x = async (e, t = {}) => await new n(e).save(t), z = async (e, t, a = {}) => {
    let d = n.findByIdAndUpdate(e, t, {
      new: !0,
      ...a
    });
    return await u(d, a);
  };
  return {
    modelName: r,
    fieldNames: Object.freeze(Object.keys(n.schema.paths)),
    initialize: async () => {
      await n.init();
    },
    saveMany: async (e, t = {}) => await n.create(e, t),
    updateWhere: async (e, t, a = {}) => await u(n.findOneAndUpdate(e, t, { new: !0, ...a }), a),
    updateMany: async (e, t, a = {}) => await n.updateMany(e, t, a),
    deleteMany: async (e, t = {}) => await n.deleteMany(e, t),
    countDocuments: async (e = {}, t = {}) => await n.countDocuments(e).session(t.session ?? null),
    exists: async (e, t = {}) => !!await n.exists(e).session(t.session ?? null),
    aggregate: async (e, t = {}) => await n.aggregate(e).option(t),
    watch: (e = [], t = {}) => n.watch(e, t),
    delete: B,
    compareHash: S,
    getAll: O,
    getById: h,
    getByCoincidence: T,
    getOne: E,
    save: x,
    update: z
  };
}, ge = (r) => R("State", {
  name: {
    type: String,
    required: !0
  },
  description: {
    type: String,
    default: ""
  },
  entity: {
    type: String,
    enum: r,
    required: !0
  }
}), pe = ({ entityId: r, model: s, populatedFields: f = [] }) => {
  async function m(o, i) {
    try {
      const { id: n } = o.params;
      if (!await s.delete(n)) {
        i.status(404).json({ message: `${r} not found.` });
        return;
      }
      i.json({ message: `${r} removed.` });
    } catch (n) {
      i.status(500).json({
        message: `${r} remove error.`,
        error: n instanceof Error ? n.message : String(n)
      });
    }
  }
  async function y(o, i) {
    try {
      const n = o.query.page ? parseInt(o.query.page) : void 0, u = o.query.pageSize ? parseInt(o.query.pageSize) : void 0, S = o.query.limit ? parseInt(o.query.limit) : void 0, O = o.query.skip ? parseInt(o.query.skip) : void 0, h = {
        populate: f
      };
      n !== void 0 && (h.page = n), u !== void 0 && (h.pageSize = u), S !== void 0 && (h.limit = S), O !== void 0 && (h.skip = O);
      const E = await s.getAll(h);
      i.json(E);
    } catch (n) {
      i.status(500).json({
        message: `${r} list error.`,
        error: n instanceof Error ? n.message : String(n)
      });
    }
  }
  async function w(o, i) {
    try {
      const { id: n } = o.params, u = await s.getById(n, {
        populate: f
      });
      if (!u) {
        i.status(404).json({ message: `${r} not found.` });
        return;
      }
      i.json(u);
    } catch (n) {
      i.status(500).json({
        message: `${r} search error.`,
        error: n instanceof Error ? n.message : String(n)
      });
    }
  }
  async function $(o, i) {
    try {
      const n = o.query.filter ? JSON.parse(o.query.filter) : o.body, u = await s.getOne(n, {
        populate: f
      });
      if (!u) {
        i.status(404).json({ message: `${r} not found.` });
        return;
      }
      i.json(u);
    } catch (n) {
      i.status(500).json({
        message: `${r} search error.`,
        error: n instanceof Error ? n.message : String(n)
      });
    }
  }
  async function v(o, i) {
    try {
      const { query: n, page: u, pageSize: S, limit: O, skip: h } = o.body;
      if (!n) {
        i.status(400).json({
          message: "Search query is required in request body."
        });
        return;
      }
      const E = {
        populate: f
      };
      u !== void 0 && (E.page = u), S !== void 0 && (E.pageSize = S), O !== void 0 && (E.limit = O), h !== void 0 && (E.skip = h);
      const T = await s.getByCoincidence(n, E);
      i.json(T);
    } catch (n) {
      i.status(500).json({
        message: `${r} search error.`,
        error: n instanceof Error ? n.message : String(n)
      });
    }
  }
  async function A(o, i) {
    try {
      const n = await s.save(o.body);
      i.status(201).json(n);
    } catch (n) {
      i.status(400).json({
        message: `${r} register error.`,
        error: n instanceof Error ? n.message : String(n)
      });
    }
  }
  async function l(o, i) {
    try {
      const { id: n } = o.params, u = await s.update(n, o.body, {
        populate: f
      });
      if (!u) {
        i.status(404).json({ message: `${r} not found.` });
        return;
      }
      i.json(u);
    } catch (n) {
      i.status(500).json({
        message: `${r} error update.`,
        error: n instanceof Error ? n.message : String(n)
      });
    }
  }
  return {
    delete: m,
    getAll: y,
    getById: w,
    getByCoincidence: v,
    getOne: $,
    register: A,
    update: l
  };
};
export {
  ce as OwlAdminCommand,
  q as OwlClusterWorkerCount,
  oe as OwlCollection,
  pe as OwlController,
  ue as OwlCors,
  M as OwlCrypto,
  ie as OwlDatabase,
  de as OwlIsAuth,
  te as OwlIsValidId,
  R as OwlModel,
  se as OwlMongoClient,
  X as OwlMongoClose,
  L as OwlMongoCommand,
  F as OwlMongoConnect,
  re as OwlMongoStatus,
  ae as OwlObjectId,
  le as OwlRateLimit,
  fe as OwlSession,
  ge as OwlState,
  ne as OwlTransaction,
  ee as OwlTypes
};
