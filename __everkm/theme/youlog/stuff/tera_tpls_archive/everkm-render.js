var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/dayjs@1.11.18/node_modules/dayjs/dayjs.min.js
var require_dayjs_min = __commonJS({
  "node_modules/.pnpm/dayjs@1.11.18/node_modules/dayjs/dayjs.min.js"(exports, module) {
    !function(t2, e) {
      "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t2 = "undefined" != typeof globalThis ? globalThis : t2 || self).dayjs = e();
    }(exports, function() {
      "use strict";
      var t2 = 1e3, e = 6e4, n2 = 36e5, r = "millisecond", i2 = "second", s = "minute", u3 = "hour", a = "day", o2 = "week", c = "month", f3 = "quarter", h = "year", d2 = "date", l2 = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M3 = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t3) {
        var e2 = ["th", "st", "nd", "rd"], n3 = t3 % 100;
        return "[" + t3 + (e2[(n3 - 20) % 10] || e2[n3] || e2[0]) + "]";
      } }, m3 = function(t3, e2, n3) {
        var r2 = String(t3);
        return !r2 || r2.length >= e2 ? t3 : "" + Array(e2 + 1 - r2.length).join(n3) + t3;
      }, v = { s: m3, z: function(t3) {
        var e2 = -t3.utcOffset(), n3 = Math.abs(e2), r2 = Math.floor(n3 / 60), i3 = n3 % 60;
        return (e2 <= 0 ? "+" : "-") + m3(r2, 2, "0") + ":" + m3(i3, 2, "0");
      }, m: function t3(e2, n3) {
        if (e2.date() < n3.date()) return -t3(n3, e2);
        var r2 = 12 * (n3.year() - e2.year()) + (n3.month() - e2.month()), i3 = e2.clone().add(r2, c), s2 = n3 - i3 < 0, u4 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
        return +(-(r2 + (n3 - i3) / (s2 ? i3 - u4 : u4 - i3)) || 0);
      }, a: function(t3) {
        return t3 < 0 ? Math.ceil(t3) || 0 : Math.floor(t3);
      }, p: function(t3) {
        return { M: c, y: h, w: o2, d: a, D: d2, h: u3, m: s, s: i2, ms: r, Q: f3 }[t3] || String(t3 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t3) {
        return void 0 === t3;
      } }, g3 = "en", D2 = {};
      D2[g3] = M3;
      var p3 = "$isDayjsObject", S3 = function(t3) {
        return t3 instanceof _3 || !(!t3 || !t3[p3]);
      }, w2 = function t3(e2, n3, r2) {
        var i3;
        if (!e2) return g3;
        if ("string" == typeof e2) {
          var s2 = e2.toLowerCase();
          D2[s2] && (i3 = s2), n3 && (D2[s2] = n3, i3 = s2);
          var u4 = e2.split("-");
          if (!i3 && u4.length > 1) return t3(u4[0]);
        } else {
          var a2 = e2.name;
          D2[a2] = e2, i3 = a2;
        }
        return !r2 && i3 && (g3 = i3), i3 || !r2 && g3;
      }, O3 = function(t3, e2) {
        if (S3(t3)) return t3.clone();
        var n3 = "object" == typeof e2 ? e2 : {};
        return n3.date = t3, n3.args = arguments, new _3(n3);
      }, b2 = v;
      b2.l = w2, b2.i = S3, b2.w = function(t3, e2) {
        return O3(t3, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _3 = function() {
        function M4(t3) {
          this.$L = w2(t3.locale, null, true), this.parse(t3), this.$x = this.$x || t3.x || {}, this[p3] = true;
        }
        var m4 = M4.prototype;
        return m4.parse = function(t3) {
          this.$d = function(t4) {
            var e2 = t4.date, n3 = t4.utc;
            if (null === e2) return /* @__PURE__ */ new Date(NaN);
            if (b2.u(e2)) return /* @__PURE__ */ new Date();
            if (e2 instanceof Date) return new Date(e2);
            if ("string" == typeof e2 && !/Z$/i.test(e2)) {
              var r2 = e2.match($);
              if (r2) {
                var i3 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                return n3 ? new Date(Date.UTC(r2[1], i3, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i3, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
              }
            }
            return new Date(e2);
          }(t3), this.init();
        }, m4.init = function() {
          var t3 = this.$d;
          this.$y = t3.getFullYear(), this.$M = t3.getMonth(), this.$D = t3.getDate(), this.$W = t3.getDay(), this.$H = t3.getHours(), this.$m = t3.getMinutes(), this.$s = t3.getSeconds(), this.$ms = t3.getMilliseconds();
        }, m4.$utils = function() {
          return b2;
        }, m4.isValid = function() {
          return !(this.$d.toString() === l2);
        }, m4.isSame = function(t3, e2) {
          var n3 = O3(t3);
          return this.startOf(e2) <= n3 && n3 <= this.endOf(e2);
        }, m4.isAfter = function(t3, e2) {
          return O3(t3) < this.startOf(e2);
        }, m4.isBefore = function(t3, e2) {
          return this.endOf(e2) < O3(t3);
        }, m4.$g = function(t3, e2, n3) {
          return b2.u(t3) ? this[e2] : this.set(n3, t3);
        }, m4.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m4.valueOf = function() {
          return this.$d.getTime();
        }, m4.startOf = function(t3, e2) {
          var n3 = this, r2 = !!b2.u(e2) || e2, f4 = b2.p(t3), l3 = function(t4, e3) {
            var i3 = b2.w(n3.$u ? Date.UTC(n3.$y, e3, t4) : new Date(n3.$y, e3, t4), n3);
            return r2 ? i3 : i3.endOf(a);
          }, $2 = function(t4, e3) {
            return b2.w(n3.toDate()[t4].apply(n3.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n3);
          }, y2 = this.$W, M5 = this.$M, m5 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
          switch (f4) {
            case h:
              return r2 ? l3(1, 0) : l3(31, 11);
            case c:
              return r2 ? l3(1, M5) : l3(0, M5 + 1);
            case o2:
              var g4 = this.$locale().weekStart || 0, D3 = (y2 < g4 ? y2 + 7 : y2) - g4;
              return l3(r2 ? m5 - D3 : m5 + (6 - D3), M5);
            case a:
            case d2:
              return $2(v2 + "Hours", 0);
            case u3:
              return $2(v2 + "Minutes", 1);
            case s:
              return $2(v2 + "Seconds", 2);
            case i2:
              return $2(v2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m4.endOf = function(t3) {
          return this.startOf(t3, false);
        }, m4.$set = function(t3, e2) {
          var n3, o3 = b2.p(t3), f4 = "set" + (this.$u ? "UTC" : ""), l3 = (n3 = {}, n3[a] = f4 + "Date", n3[d2] = f4 + "Date", n3[c] = f4 + "Month", n3[h] = f4 + "FullYear", n3[u3] = f4 + "Hours", n3[s] = f4 + "Minutes", n3[i2] = f4 + "Seconds", n3[r] = f4 + "Milliseconds", n3)[o3], $2 = o3 === a ? this.$D + (e2 - this.$W) : e2;
          if (o3 === c || o3 === h) {
            var y2 = this.clone().set(d2, 1);
            y2.$d[l3]($2), y2.init(), this.$d = y2.set(d2, Math.min(this.$D, y2.daysInMonth())).$d;
          } else l3 && this.$d[l3]($2);
          return this.init(), this;
        }, m4.set = function(t3, e2) {
          return this.clone().$set(t3, e2);
        }, m4.get = function(t3) {
          return this[b2.p(t3)]();
        }, m4.add = function(r2, f4) {
          var d3, l3 = this;
          r2 = Number(r2);
          var $2 = b2.p(f4), y2 = function(t3) {
            var e2 = O3(l3);
            return b2.w(e2.date(e2.date() + Math.round(t3 * r2)), l3);
          };
          if ($2 === c) return this.set(c, this.$M + r2);
          if ($2 === h) return this.set(h, this.$y + r2);
          if ($2 === a) return y2(1);
          if ($2 === o2) return y2(7);
          var M5 = (d3 = {}, d3[s] = e, d3[u3] = n2, d3[i2] = t2, d3)[$2] || 1, m5 = this.$d.getTime() + r2 * M5;
          return b2.w(m5, this);
        }, m4.subtract = function(t3, e2) {
          return this.add(-1 * t3, e2);
        }, m4.format = function(t3) {
          var e2 = this, n3 = this.$locale();
          if (!this.isValid()) return n3.invalidDate || l2;
          var r2 = t3 || "YYYY-MM-DDTHH:mm:ssZ", i3 = b2.z(this), s2 = this.$H, u4 = this.$m, a2 = this.$M, o3 = n3.weekdays, c2 = n3.months, f4 = n3.meridiem, h2 = function(t4, n4, i4, s3) {
            return t4 && (t4[n4] || t4(e2, r2)) || i4[n4].slice(0, s3);
          }, d3 = function(t4) {
            return b2.s(s2 % 12 || 12, t4, "0");
          }, $2 = f4 || function(t4, e3, n4) {
            var r3 = t4 < 12 ? "AM" : "PM";
            return n4 ? r3.toLowerCase() : r3;
          };
          return r2.replace(y, function(t4, r3) {
            return r3 || function(t5) {
              switch (t5) {
                case "YY":
                  return String(e2.$y).slice(-2);
                case "YYYY":
                  return b2.s(e2.$y, 4, "0");
                case "M":
                  return a2 + 1;
                case "MM":
                  return b2.s(a2 + 1, 2, "0");
                case "MMM":
                  return h2(n3.monthsShort, a2, c2, 3);
                case "MMMM":
                  return h2(c2, a2);
                case "D":
                  return e2.$D;
                case "DD":
                  return b2.s(e2.$D, 2, "0");
                case "d":
                  return String(e2.$W);
                case "dd":
                  return h2(n3.weekdaysMin, e2.$W, o3, 2);
                case "ddd":
                  return h2(n3.weekdaysShort, e2.$W, o3, 3);
                case "dddd":
                  return o3[e2.$W];
                case "H":
                  return String(s2);
                case "HH":
                  return b2.s(s2, 2, "0");
                case "h":
                  return d3(1);
                case "hh":
                  return d3(2);
                case "a":
                  return $2(s2, u4, true);
                case "A":
                  return $2(s2, u4, false);
                case "m":
                  return String(u4);
                case "mm":
                  return b2.s(u4, 2, "0");
                case "s":
                  return String(e2.$s);
                case "ss":
                  return b2.s(e2.$s, 2, "0");
                case "SSS":
                  return b2.s(e2.$ms, 3, "0");
                case "Z":
                  return i3;
              }
              return null;
            }(t4) || i3.replace(":", "");
          });
        }, m4.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m4.diff = function(r2, d3, l3) {
          var $2, y2 = this, M5 = b2.p(d3), m5 = O3(r2), v2 = (m5.utcOffset() - this.utcOffset()) * e, g4 = this - m5, D3 = function() {
            return b2.m(y2, m5);
          };
          switch (M5) {
            case h:
              $2 = D3() / 12;
              break;
            case c:
              $2 = D3();
              break;
            case f3:
              $2 = D3() / 3;
              break;
            case o2:
              $2 = (g4 - v2) / 6048e5;
              break;
            case a:
              $2 = (g4 - v2) / 864e5;
              break;
            case u3:
              $2 = g4 / n2;
              break;
            case s:
              $2 = g4 / e;
              break;
            case i2:
              $2 = g4 / t2;
              break;
            default:
              $2 = g4;
          }
          return l3 ? $2 : b2.a($2);
        }, m4.daysInMonth = function() {
          return this.endOf(c).$D;
        }, m4.$locale = function() {
          return D2[this.$L];
        }, m4.locale = function(t3, e2) {
          if (!t3) return this.$L;
          var n3 = this.clone(), r2 = w2(t3, e2, true);
          return r2 && (n3.$L = r2), n3;
        }, m4.clone = function() {
          return b2.w(this.$d, this);
        }, m4.toDate = function() {
          return new Date(this.valueOf());
        }, m4.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m4.toISOString = function() {
          return this.$d.toISOString();
        }, m4.toString = function() {
          return this.$d.toUTCString();
        }, M4;
      }(), k = _3.prototype;
      return O3.prototype = k, [["$ms", r], ["$s", i2], ["$m", s], ["$H", u3], ["$W", a], ["$M", c], ["$y", h], ["$D", d2]].forEach(function(t3) {
        k[t3[1]] = function(e2) {
          return this.$g(e2, t3[0], t3[1]);
        };
      }), O3.extend = function(t3, e2) {
        return t3.$i || (t3(e2, _3, O3), t3.$i = true), O3;
      }, O3.locale = w2, O3.isDayjs = S3, O3.unix = function(t3) {
        return O3(1e3 * t3);
      }, O3.en = D2[g3], O3.Ls = D2, O3.p = {}, O3;
    });
  }
});

// node_modules/.pnpm/solid-js@1.9.5/node_modules/solid-js/dist/server.js
var $PROXY = Symbol("solid-proxy");
var $TRACK = Symbol("solid-track");
var $DEVCOMP = Symbol("solid-dev-component");
var ERROR = Symbol("error");
function castError(err) {
  if (err instanceof Error) return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function handleError(err, owner = Owner) {
  const fns = owner && owner.context && owner.context[ERROR];
  const error = castError(err);
  if (!fns) throw error;
  try {
    for (const f3 of fns) f3(error);
  } catch (e) {
    handleError(e, owner && owner.owner || null);
  }
}
var UNOWNED = {
  context: null,
  owner: null,
  owned: null,
  cleanups: null
};
var Owner = null;
function createOwner() {
  const o2 = {
    owner: Owner,
    context: Owner ? Owner.context : null,
    owned: null,
    cleanups: null
  };
  if (Owner) {
    if (!Owner.owned) Owner.owned = [o2];
    else Owner.owned.push(o2);
  }
  return o2;
}
function createRoot(fn, detachedOwner) {
  const owner = Owner, current = detachedOwner === void 0 ? owner : detachedOwner, root = fn.length === 0 ? UNOWNED : {
    context: current ? current.context : null,
    owner: current,
    owned: null,
    cleanups: null
  };
  Owner = root;
  let result;
  try {
    result = fn(fn.length === 0 ? () => {
    } : () => cleanNode(root));
  } catch (err) {
    handleError(err);
  } finally {
    Owner = owner;
  }
  return result;
}
function createMemo(fn, value) {
  Owner = createOwner();
  let v;
  try {
    v = fn(value);
  } catch (err) {
    handleError(err);
  } finally {
    Owner = Owner.owner;
  }
  return () => v;
}
function cleanNode(node) {
  if (node.owned) {
    for (let i2 = 0; i2 < node.owned.length; i2++) cleanNode(node.owned[i2]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (let i2 = 0; i2 < node.cleanups.length; i2++) node.cleanups[i2]();
    node.cleanups = null;
  }
}
function createContext(defaultValue) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
}
function children(fn) {
  const memo = createMemo(() => resolveChildren(fn()));
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
function resolveChildren(children2) {
  if (typeof children2 === "function" && !children2.length) return resolveChildren(children2());
  if (Array.isArray(children2)) {
    const results = [];
    for (let i2 = 0; i2 < children2.length; i2++) {
      const result = resolveChildren(children2[i2]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children2;
}
function createProvider(id) {
  return function provider(props) {
    return createMemo(() => {
      Owner.context = {
        ...Owner.context,
        [id]: props.value
      };
      return children(() => props.children);
    });
  };
}
var sharedConfig = {
  context: void 0,
  getContextId() {
    if (!this.context) throw new Error(`getContextId cannot be used under non-hydrating context`);
    return getContextId(this.context.count);
  },
  getNextContextId() {
    if (!this.context)
      throw new Error(`getNextContextId cannot be used under non-hydrating context`);
    return getContextId(this.context.count++);
  }
};
function getContextId(count) {
  const num = String(count), len = num.length - 1;
  return sharedConfig.context.id + (len ? String.fromCharCode(96 + len) : "") + num;
}
function setHydrateContext(context) {
  sharedConfig.context = context;
}
function nextHydrateContext() {
  return sharedConfig.context ? {
    ...sharedConfig.context,
    id: sharedConfig.getNextContextId(),
    count: 0
  } : void 0;
}
function createComponent(Comp, props) {
  if (sharedConfig.context && !sharedConfig.context.noHydrate) {
    const c = sharedConfig.context;
    setHydrateContext(nextHydrateContext());
    const r = Comp(props || {});
    setHydrateContext(c);
    return r;
  }
  return Comp(props || {});
}
function mergeProps(...sources) {
  const target = {};
  for (let i2 = 0; i2 < sources.length; i2++) {
    let source = sources[i2];
    if (typeof source === "function") source = source();
    if (source) {
      const descriptors = Object.getOwnPropertyDescriptors(source);
      for (const key in descriptors) {
        if (key in target) continue;
        Object.defineProperty(target, key, {
          enumerable: true,
          get() {
            for (let i3 = sources.length - 1; i3 >= 0; i3--) {
              let v, s = sources[i3];
              if (typeof s === "function") s = s();
              v = (s || {})[key];
              if (v !== void 0) return v;
            }
          }
        });
      }
    }
  }
  return target;
}
function simpleMap(props, wrap) {
  const list = props.each || [], len = list.length, fn = props.children;
  if (len) {
    let mapped = Array(len);
    for (let i2 = 0; i2 < len; i2++) mapped[i2] = wrap(fn, list[i2], i2);
    return mapped;
  }
  return props.fallback;
}
function For(props) {
  return simpleMap(props, (fn, item, i2) => fn(item, () => i2));
}
function Show(props) {
  let c;
  return props.when ? typeof (c = props.children) === "function" ? c(props.keyed ? props.when : () => props.when) : c : props.fallback || "";
}
var SuspenseContext = createContext();

// node_modules/.pnpm/seroval@1.2.1/node_modules/seroval/dist/esm/production/index.mjs
var F = ((i2) => (i2[i2.AggregateError = 1] = "AggregateError", i2[i2.ArrowFunction = 2] = "ArrowFunction", i2[i2.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", i2[i2.ObjectAssign = 8] = "ObjectAssign", i2[i2.BigIntTypedArray = 16] = "BigIntTypedArray", i2[i2.AbortSignal = 32] = "AbortSignal", i2))(F || {});
function yr(o2) {
  switch (o2) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case `
`:
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return;
  }
}
function p(o2) {
  let e = "", r = 0, s;
  for (let n2 = 0, a = o2.length; n2 < a; n2++) s = yr(o2[n2]), s && (e += o2.slice(r, n2) + s, r = n2 + 1);
  return r === 0 ? e = o2 : e += o2.slice(r), e;
}
var E = "__SEROVAL_REFS__";
var Z = "$R";
var oe = `self.${Z}`;
function br(o2) {
  return o2 == null ? `${oe}=${oe}||[]` : `(${oe}=${oe}||{})["${p(o2)}"]=[]`;
}
function m(o2, e) {
  if (!o2) throw e;
}
var De = /* @__PURE__ */ new Map();
var R = /* @__PURE__ */ new Map();
function Be(o2) {
  return De.has(o2);
}
function Le(o2) {
  return m(Be(o2), new ne(o2)), De.get(o2);
}
typeof globalThis != "undefined" ? Object.defineProperty(globalThis, E, { value: R, configurable: true, writable: false, enumerable: false }) : typeof window != "undefined" ? Object.defineProperty(window, E, { value: R, configurable: true, writable: false, enumerable: false }) : typeof self != "undefined" ? Object.defineProperty(self, E, { value: R, configurable: true, writable: false, enumerable: false }) : typeof globalThis != "undefined" && Object.defineProperty(globalThis, E, { value: R, configurable: true, writable: false, enumerable: false });
function Yr(o2) {
  return o2;
}
function Ke(o2, e) {
  for (let r = 0, s = e.length; r < s; r++) {
    let n2 = e[r];
    o2.has(n2) || (o2.add(n2), n2.extends && Ke(o2, n2.extends));
  }
}
function f(o2) {
  if (o2) {
    let e = /* @__PURE__ */ new Set();
    return Ke(e, o2), [...e];
  }
}
var Ye = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" };
var ie = { [Symbol.asyncIterator]: 0, [Symbol.hasInstance]: 1, [Symbol.isConcatSpreadable]: 2, [Symbol.iterator]: 3, [Symbol.match]: 4, [Symbol.matchAll]: 5, [Symbol.replace]: 6, [Symbol.search]: 7, [Symbol.species]: 8, [Symbol.split]: 9, [Symbol.toPrimitive]: 10, [Symbol.toStringTag]: 11, [Symbol.unscopables]: 12 };
var Ge = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" };
var qe = { 2: true, 3: false, 1: void 0, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN };
var le = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" };
var t = void 0;
function u(o2, e, r, s, n2, a, i2, l2, c, d2, h, H2) {
  return { t: o2, i: e, s: r, l: s, c: n2, m: a, p: i2, e: l2, a: c, f: d2, b: h, o: H2 };
}
function A(o2) {
  return u(2, t, o2, t, t, t, t, t, t, t, t, t);
}
var x = A(2);
var I = A(3);
var ce = A(1);
var ue = A(0);
var Ze = A(4);
var Xe = A(5);
var Qe = A(6);
var er = A(7);
function de(o2) {
  return o2 instanceof EvalError ? 1 : o2 instanceof RangeError ? 2 : o2 instanceof ReferenceError ? 3 : o2 instanceof SyntaxError ? 4 : o2 instanceof TypeError ? 5 : o2 instanceof URIError ? 6 : 0;
}
function wr(o2) {
  let e = le[de(o2)];
  return o2.name !== e ? { name: o2.name } : o2.constructor.name !== e ? { name: o2.constructor.name } : {};
}
function V(o2, e) {
  let r = wr(o2), s = Object.getOwnPropertyNames(o2);
  for (let n2 = 0, a = s.length, i2; n2 < a; n2++) i2 = s[n2], i2 !== "name" && i2 !== "message" && (i2 === "stack" ? e & 4 && (r = r || {}, r[i2] = o2[i2]) : (r = r || {}, r[i2] = o2[i2]));
  return r;
}
function pe(o2) {
  return Object.isFrozen(o2) ? 3 : Object.isSealed(o2) ? 2 : Object.isExtensible(o2) ? 0 : 1;
}
function fe(o2) {
  switch (o2) {
    case Number.POSITIVE_INFINITY:
      return Xe;
    case Number.NEGATIVE_INFINITY:
      return Qe;
  }
  return o2 !== o2 ? er : Object.is(o2, -0) ? Ze : u(0, t, o2, t, t, t, t, t, t, t, t, t);
}
function w(o2) {
  return u(1, t, p(o2), t, t, t, t, t, t, t, t, t);
}
function me(o2) {
  return u(3, t, "" + o2, t, t, t, t, t, t, t, t, t);
}
function tr(o2) {
  return u(4, o2, t, t, t, t, t, t, t, t, t, t);
}
function Se(o2, e) {
  return u(5, o2, e.toISOString(), t, t, t, t, t, t, t, t, t);
}
function ge(o2, e) {
  return u(6, o2, t, t, p(e.source), e.flags, t, t, t, t, t, t);
}
function he(o2, e) {
  let r = new Uint8Array(e), s = r.length, n2 = new Array(s);
  for (let a = 0; a < s; a++) n2[a] = r[a];
  return u(19, o2, n2, t, t, t, t, t, t, t, t, t);
}
function sr(o2, e) {
  return u(17, o2, ie[e], t, t, t, t, t, t, t, t, t);
}
function or(o2, e) {
  return u(18, o2, p(Le(e)), t, t, t, t, t, t, t, t, t);
}
function D(o2, e, r) {
  return u(25, o2, r, t, p(e), t, t, t, t, t, t, t);
}
function ye(o2, e, r) {
  return u(9, o2, t, e.length, t, t, t, t, r, t, t, pe(e));
}
function ve(o2, e) {
  return u(21, o2, t, t, t, t, t, t, t, e, t, t);
}
function be(o2, e, r) {
  return u(15, o2, t, e.length, e.constructor.name, t, t, t, t, r, e.byteOffset, t);
}
function Ne(o2, e, r) {
  return u(16, o2, t, e.length, e.constructor.name, t, t, t, t, r, e.byteOffset, t);
}
function Ae(o2, e, r) {
  return u(20, o2, t, e.byteLength, t, t, t, t, t, r, e.byteOffset, t);
}
function xe(o2, e, r) {
  return u(13, o2, de(e), t, t, p(e.message), r, t, t, t, t, t);
}
function Ie(o2, e, r) {
  return u(14, o2, de(e), t, t, p(e.message), r, t, t, t, t, t);
}
function we(o2, e, r) {
  return u(7, o2, t, e, t, t, t, t, r, t, t, t);
}
function B(o2, e) {
  return u(28, t, t, t, t, t, t, t, [o2, e], t, t, t);
}
function j(o2, e) {
  return u(30, t, t, t, t, t, t, t, [o2, e], t, t, t);
}
function _(o2, e, r) {
  return u(31, o2, t, t, t, t, t, t, r, e, t, t);
}
function Ee(o2, e) {
  return u(32, o2, t, t, t, t, t, t, t, e, t, t);
}
function Re(o2, e) {
  return u(33, o2, t, t, t, t, t, t, t, e, t, t);
}
function Pe(o2, e) {
  return u(34, o2, t, t, t, t, t, t, t, e, t, t);
}
var { toString: je } = Object.prototype;
function Er(o2, e) {
  return e instanceof Error ? `Seroval caught an error during the ${o2} process.
  
${e.name}
${e.message}

- For more information, please check the "cause" property of this error.
- If you believe this is an error in Seroval, please submit an issue at https://github.com/lxsmnsyc/seroval/issues/new` : `Seroval caught an error during the ${o2} process.

"${je.call(e)}"

For more information, please check the "cause" property of this error.`;
}
var X = class extends Error {
  constructor(r, s) {
    super(Er(r, s));
    this.cause = s;
  }
};
var M = class extends X {
  constructor(e) {
    super("parsing", e);
  }
};
var Ce = class extends X {
  constructor(e) {
    super("serialization", e);
  }
};
var S = class extends Error {
  constructor(r) {
    super(`The value ${je.call(r)} of type "${typeof r}" cannot be parsed/serialized.
      
There are few workarounds for this problem:
- Transform the value in a way that it can be serialized.
- If the reference is present on multiple runtimes (isomorphic), you can use the Reference API to map the references.`);
    this.value = r;
  }
};
var g = class extends Error {
  constructor(e) {
    super('Unsupported node type "' + e.t + '".');
  }
};
var U = class extends Error {
  constructor(e) {
    super('Missing plugin for tag "' + e + '".');
  }
};
var ne = class extends Error {
  constructor(r) {
    super('Missing reference for the value "' + je.call(r) + '" of type "' + typeof r + '"');
    this.value = r;
  }
};
var P = class {
  constructor(e, r) {
    this.value = e;
    this.replacement = r;
  }
};
var nr = {};
var ar = {};
var ir = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} };
function Te(o2) {
  return "__SEROVAL_STREAM__" in o2;
}
function L() {
  let o2 = /* @__PURE__ */ new Set(), e = [], r = true, s = true;
  function n2(l2) {
    for (let c of o2.keys()) c.next(l2);
  }
  function a(l2) {
    for (let c of o2.keys()) c.throw(l2);
  }
  function i2(l2) {
    for (let c of o2.keys()) c.return(l2);
  }
  return { __SEROVAL_STREAM__: true, on(l2) {
    r && o2.add(l2);
    for (let c = 0, d2 = e.length; c < d2; c++) {
      let h = e[c];
      c === d2 - 1 && !r ? s ? l2.return(h) : l2.throw(h) : l2.next(h);
    }
    return () => {
      r && o2.delete(l2);
    };
  }, next(l2) {
    r && (e.push(l2), n2(l2));
  }, throw(l2) {
    r && (e.push(l2), a(l2), r = false, s = false, o2.clear());
  }, return(l2) {
    r && (e.push(l2), i2(l2), r = false, s = true, o2.clear());
  } };
}
function ke(o2) {
  let e = L(), r = o2[Symbol.asyncIterator]();
  async function s() {
    try {
      let n2 = await r.next();
      n2.done ? e.return(n2.value) : (e.next(n2.value), await s());
    } catch (n2) {
      e.throw(n2);
    }
  }
  return s().catch(() => {
  }), e;
}
function W(o2) {
  let e = [], r = -1, s = -1, n2 = o2[Symbol.iterator]();
  for (; ; ) try {
    let a = n2.next();
    if (e.push(a.value), a.done) {
      s = e.length - 1;
      break;
    }
  } catch (a) {
    r = e.length, e.push(a);
  }
  return { v: e, t: r, d: s };
}
var K = class {
  constructor(e) {
    this.marked = /* @__PURE__ */ new Set();
    this.plugins = e.plugins, this.features = 47 ^ (e.disabledFeatures || 0), this.refs = e.refs || /* @__PURE__ */ new Map();
  }
  markRef(e) {
    this.marked.add(e);
  }
  isMarked(e) {
    return this.marked.has(e);
  }
  getIndexedValue(e) {
    let r = this.refs.get(e);
    if (r != null) return this.markRef(r), { type: 1, value: tr(r) };
    let s = this.refs.size;
    return this.refs.set(e, s), { type: 0, value: s };
  }
  getReference(e) {
    let r = this.getIndexedValue(e);
    return r.type === 1 ? r : Be(e) ? { type: 2, value: or(r.value, e) } : r;
  }
  parseWellKnownSymbol(e) {
    let r = this.getReference(e);
    return r.type !== 0 ? r.value : (m(e in ie, new S(e)), sr(r.value, e));
  }
  parseSpecialReference(e) {
    let r = this.getIndexedValue(ir[e]);
    return r.type === 1 ? r.value : u(26, r.value, e, t, t, t, t, t, t, t, t, t);
  }
  parseIteratorFactory() {
    let e = this.getIndexedValue(nr);
    return e.type === 1 ? e.value : u(27, e.value, t, t, t, t, t, t, t, this.parseWellKnownSymbol(Symbol.iterator), t, t);
  }
  parseAsyncIteratorFactory() {
    let e = this.getIndexedValue(ar);
    return e.type === 1 ? e.value : u(29, e.value, t, t, t, t, t, t, [this.parseSpecialReference(1), this.parseWellKnownSymbol(Symbol.asyncIterator)], t, t, t);
  }
  createObjectNode(e, r, s, n2) {
    return u(s ? 11 : 10, e, t, t, t, t, n2, t, t, t, t, pe(r));
  }
  createMapNode(e, r, s, n2) {
    return u(8, e, t, t, t, t, t, { k: r, v: s, s: n2 }, t, this.parseSpecialReference(0), t, t);
  }
  createPromiseConstructorNode(e) {
    return u(22, e, t, t, t, t, t, t, t, this.parseSpecialReference(1), t, t);
  }
  createAbortSignalConstructorNode(e) {
    return u(35, e, t, t, t, t, t, t, t, this.parseSpecialReference(5), t, t);
  }
};
var Cr = /^[$A-Z_][0-9A-Z_$]*$/i;
function Me(o2) {
  let e = o2[0];
  return (e === "$" || e === "_" || e >= "A" && e <= "Z" || e >= "a" && e <= "z") && Cr.test(o2);
}
function re(o2) {
  switch (o2.t) {
    case 0:
      return o2.s + "=" + o2.v;
    case 2:
      return o2.s + ".set(" + o2.k + "," + o2.v + ")";
    case 1:
      return o2.s + ".add(" + o2.v + ")";
    case 3:
      return o2.s + ".delete(" + o2.k + ")";
  }
}
function zr(o2) {
  let e = [], r = o2[0];
  for (let s = 1, n2 = o2.length, a, i2 = r; s < n2; s++) a = o2[s], a.t === 0 && a.v === i2.v ? r = { t: 0, s: a.s, k: t, v: re(r) } : a.t === 2 && a.s === i2.s ? r = { t: 2, s: re(r), k: a.k, v: a.v } : a.t === 1 && a.s === i2.s ? r = { t: 1, s: re(r), k: t, v: a.v } : a.t === 3 && a.s === i2.s ? r = { t: 3, s: re(r), k: a.k, v: t } : (e.push(r), r = a), i2 = a;
  return e.push(r), e;
}
function pr(o2) {
  if (o2.length) {
    let e = "", r = zr(o2);
    for (let s = 0, n2 = r.length; s < n2; s++) e += re(r[s]) + ",";
    return e;
  }
  return t;
}
var Or = "Object.create(null)";
var Tr = "new Set";
var kr = "new Map";
var Fr = "Promise.resolve";
var Vr = "Promise.reject";
var Dr = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: t };
var O = class {
  constructor(e) {
    this.stack = [];
    this.flags = [];
    this.assignments = [];
    this.plugins = e.plugins, this.features = e.features, this.marked = new Set(e.markedRefs);
  }
  createFunction(e, r) {
    return this.features & 2 ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (r.startsWith("{") ? "(" + r + ")" : r) : "function(" + e.join(",") + "){return " + r + "}";
  }
  createEffectfulFunction(e, r) {
    return this.features & 2 ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + r + "}" : "function(" + e.join(",") + "){" + r + "}";
  }
  markRef(e) {
    this.marked.add(e);
  }
  isMarked(e) {
    return this.marked.has(e);
  }
  pushObjectFlag(e, r) {
    e !== 0 && (this.markRef(r), this.flags.push({ type: e, value: this.getRefParam(r) }));
  }
  resolveFlags() {
    let e = "";
    for (let r = 0, s = this.flags, n2 = s.length; r < n2; r++) {
      let a = s[r];
      e += Dr[a.type] + "(" + a.value + "),";
    }
    return e;
  }
  resolvePatches() {
    let e = pr(this.assignments), r = this.resolveFlags();
    return e ? r ? e + r : e : r;
  }
  createAssignment(e, r) {
    this.assignments.push({ t: 0, s: e, k: t, v: r });
  }
  createAddAssignment(e, r) {
    this.assignments.push({ t: 1, s: this.getRefParam(e), k: t, v: r });
  }
  createSetAssignment(e, r, s) {
    this.assignments.push({ t: 2, s: this.getRefParam(e), k: r, v: s });
  }
  createDeleteAssignment(e, r) {
    this.assignments.push({ t: 3, s: this.getRefParam(e), k: r, v: t });
  }
  createArrayAssign(e, r, s) {
    this.createAssignment(this.getRefParam(e) + "[" + r + "]", s);
  }
  createObjectAssign(e, r, s) {
    this.createAssignment(this.getRefParam(e) + "." + r, s);
  }
  isIndexedValueInStack(e) {
    return e.t === 4 && this.stack.includes(e.i);
  }
  serializeReference(e) {
    return this.assignIndexedValue(e.i, E + '.get("' + e.s + '")');
  }
  serializeArrayItem(e, r, s) {
    return r ? this.isIndexedValueInStack(r) ? (this.markRef(e), this.createArrayAssign(e, s, this.getRefParam(r.i)), "") : this.serialize(r) : "";
  }
  serializeArray(e) {
    let r = e.i;
    if (e.l) {
      this.stack.push(r);
      let s = e.a, n2 = this.serializeArrayItem(r, s[0], 0), a = n2 === "";
      for (let i2 = 1, l2 = e.l, c; i2 < l2; i2++) c = this.serializeArrayItem(r, s[i2], i2), n2 += "," + c, a = c === "";
      return this.stack.pop(), this.pushObjectFlag(e.o, e.i), this.assignIndexedValue(r, "[" + n2 + (a ? ",]" : "]"));
    }
    return this.assignIndexedValue(r, "[]");
  }
  serializeProperty(e, r, s) {
    if (typeof r == "string") {
      let n2 = Number(r), a = n2 >= 0 && n2.toString() === r || Me(r);
      if (this.isIndexedValueInStack(s)) {
        let i2 = this.getRefParam(s.i);
        return this.markRef(e.i), a && n2 !== n2 ? this.createObjectAssign(e.i, r, i2) : this.createArrayAssign(e.i, a ? r : '"' + r + '"', i2), "";
      }
      return (a ? r : '"' + r + '"') + ":" + this.serialize(s);
    }
    return "[" + this.serialize(r) + "]:" + this.serialize(s);
  }
  serializeProperties(e, r) {
    let s = r.s;
    if (s) {
      let n2 = r.k, a = r.v;
      this.stack.push(e.i);
      let i2 = this.serializeProperty(e, n2[0], a[0]);
      for (let l2 = 1, c = i2; l2 < s; l2++) c = this.serializeProperty(e, n2[l2], a[l2]), i2 += (c && i2 && ",") + c;
      return this.stack.pop(), "{" + i2 + "}";
    }
    return "{}";
  }
  serializeObject(e) {
    return this.pushObjectFlag(e.o, e.i), this.assignIndexedValue(e.i, this.serializeProperties(e, e.p));
  }
  serializeWithObjectAssign(e, r, s) {
    let n2 = this.serializeProperties(e, r);
    return n2 !== "{}" ? "Object.assign(" + s + "," + n2 + ")" : s;
  }
  serializeStringKeyAssignment(e, r, s, n2) {
    let a = this.serialize(n2), i2 = Number(s), l2 = i2 >= 0 && i2.toString() === s || Me(s);
    if (this.isIndexedValueInStack(n2)) l2 && i2 !== i2 ? this.createObjectAssign(e.i, s, a) : this.createArrayAssign(e.i, l2 ? s : '"' + s + '"', a);
    else {
      let c = this.assignments;
      this.assignments = r, l2 && i2 !== i2 ? this.createObjectAssign(e.i, s, a) : this.createArrayAssign(e.i, l2 ? s : '"' + s + '"', a), this.assignments = c;
    }
  }
  serializeAssignment(e, r, s, n2) {
    if (typeof s == "string") this.serializeStringKeyAssignment(e, r, s, n2);
    else {
      let a = this.stack;
      this.stack = [];
      let i2 = this.serialize(n2);
      this.stack = a;
      let l2 = this.assignments;
      this.assignments = r, this.createArrayAssign(e.i, this.serialize(s), i2), this.assignments = l2;
    }
  }
  serializeAssignments(e, r) {
    let s = r.s;
    if (s) {
      let n2 = [], a = r.k, i2 = r.v;
      this.stack.push(e.i);
      for (let l2 = 0; l2 < s; l2++) this.serializeAssignment(e, n2, a[l2], i2[l2]);
      return this.stack.pop(), pr(n2);
    }
    return t;
  }
  serializeDictionary(e, r) {
    if (e.p) if (this.features & 8) r = this.serializeWithObjectAssign(e, e.p, r);
    else {
      this.markRef(e.i);
      let s = this.serializeAssignments(e, e.p);
      if (s) return "(" + this.assignIndexedValue(e.i, r) + "," + s + this.getRefParam(e.i) + ")";
    }
    return this.assignIndexedValue(e.i, r);
  }
  serializeNullConstructor(e) {
    return this.pushObjectFlag(e.o, e.i), this.serializeDictionary(e, Or);
  }
  serializeDate(e) {
    return this.assignIndexedValue(e.i, 'new Date("' + e.s + '")');
  }
  serializeRegExp(e) {
    return this.assignIndexedValue(e.i, "/" + e.c + "/" + e.m);
  }
  serializeSetItem(e, r) {
    return this.isIndexedValueInStack(r) ? (this.markRef(e), this.createAddAssignment(e, this.getRefParam(r.i)), "") : this.serialize(r);
  }
  serializeSet(e) {
    let r = Tr, s = e.l, n2 = e.i;
    if (s) {
      let a = e.a;
      this.stack.push(n2);
      let i2 = this.serializeSetItem(n2, a[0]);
      for (let l2 = 1, c = i2; l2 < s; l2++) c = this.serializeSetItem(n2, a[l2]), i2 += (c && i2 && ",") + c;
      this.stack.pop(), i2 && (r += "([" + i2 + "])");
    }
    return this.assignIndexedValue(n2, r);
  }
  serializeMapEntry(e, r, s, n2) {
    if (this.isIndexedValueInStack(r)) {
      let a = this.getRefParam(r.i);
      if (this.markRef(e), this.isIndexedValueInStack(s)) {
        let l2 = this.getRefParam(s.i);
        return this.createSetAssignment(e, a, l2), "";
      }
      if (s.t !== 4 && s.i != null && this.isMarked(s.i)) {
        let l2 = "(" + this.serialize(s) + ",[" + n2 + "," + n2 + "])";
        return this.createSetAssignment(e, a, this.getRefParam(s.i)), this.createDeleteAssignment(e, n2), l2;
      }
      let i2 = this.stack;
      return this.stack = [], this.createSetAssignment(e, a, this.serialize(s)), this.stack = i2, "";
    }
    if (this.isIndexedValueInStack(s)) {
      let a = this.getRefParam(s.i);
      if (this.markRef(e), r.t !== 4 && r.i != null && this.isMarked(r.i)) {
        let l2 = "(" + this.serialize(r) + ",[" + n2 + "," + n2 + "])";
        return this.createSetAssignment(e, this.getRefParam(r.i), a), this.createDeleteAssignment(e, n2), l2;
      }
      let i2 = this.stack;
      return this.stack = [], this.createSetAssignment(e, this.serialize(r), a), this.stack = i2, "";
    }
    return "[" + this.serialize(r) + "," + this.serialize(s) + "]";
  }
  serializeMap(e) {
    let r = kr, s = e.e.s, n2 = e.i, a = e.f, i2 = this.getRefParam(a.i);
    if (s) {
      let l2 = e.e.k, c = e.e.v;
      this.stack.push(n2);
      let d2 = this.serializeMapEntry(n2, l2[0], c[0], i2);
      for (let h = 1, H2 = d2; h < s; h++) H2 = this.serializeMapEntry(n2, l2[h], c[h], i2), d2 += (H2 && d2 && ",") + H2;
      this.stack.pop(), d2 && (r += "([" + d2 + "])");
    }
    return a.t === 26 && (this.markRef(a.i), r = "(" + this.serialize(a) + "," + r + ")"), this.assignIndexedValue(n2, r);
  }
  serializeArrayBuffer(e) {
    let r = "new Uint8Array(", s = e.s, n2 = s.length;
    if (n2) {
      r += "[" + s[0];
      for (let a = 1; a < n2; a++) r += "," + s[a];
      r += "]";
    }
    return this.assignIndexedValue(e.i, r + ").buffer");
  }
  serializeTypedArray(e) {
    return this.assignIndexedValue(e.i, "new " + e.c + "(" + this.serialize(e.f) + "," + e.b + "," + e.l + ")");
  }
  serializeDataView(e) {
    return this.assignIndexedValue(e.i, "new DataView(" + this.serialize(e.f) + "," + e.b + "," + e.l + ")");
  }
  serializeAggregateError(e) {
    let r = e.i;
    this.stack.push(r);
    let s = this.serializeDictionary(e, 'new AggregateError([],"' + e.m + '")');
    return this.stack.pop(), s;
  }
  serializeError(e) {
    return this.serializeDictionary(e, "new " + le[e.s] + '("' + e.m + '")');
  }
  serializePromise(e) {
    let r, s = e.f, n2 = e.i, a = e.s ? Fr : Vr;
    if (this.isIndexedValueInStack(s)) {
      let i2 = this.getRefParam(s.i);
      r = a + (e.s ? "().then(" + this.createFunction([], i2) + ")" : "().catch(" + this.createEffectfulFunction([], "throw " + i2) + ")");
    } else {
      this.stack.push(n2);
      let i2 = this.serialize(s);
      this.stack.pop(), r = a + "(" + i2 + ")";
    }
    return this.assignIndexedValue(n2, r);
  }
  serializeWellKnownSymbol(e) {
    return this.assignIndexedValue(e.i, Ye[e.s]);
  }
  serializeBoxed(e) {
    return this.assignIndexedValue(e.i, "Object(" + this.serialize(e.f) + ")");
  }
  serializePlugin(e) {
    let r = this.plugins;
    if (r) for (let s = 0, n2 = r.length; s < n2; s++) {
      let a = r[s];
      if (a.tag === e.c) return this.assignIndexedValue(e.i, a.serialize(e.s, this, { id: e.i }));
    }
    throw new U(e.c);
  }
  getConstructor(e) {
    let r = this.serialize(e);
    return r === this.getRefParam(e.i) ? r : "(" + r + ")";
  }
  serializePromiseConstructor(e) {
    return this.assignIndexedValue(e.i, this.getConstructor(e.f) + "()");
  }
  serializePromiseResolve(e) {
    return this.getConstructor(e.a[0]) + "(" + this.getRefParam(e.i) + "," + this.serialize(e.a[1]) + ")";
  }
  serializePromiseReject(e) {
    return this.getConstructor(e.a[0]) + "(" + this.getRefParam(e.i) + "," + this.serialize(e.a[1]) + ")";
  }
  serializeSpecialReferenceValue(e) {
    switch (e) {
      case 0:
        return "[]";
      case 1:
        return this.createFunction(["s", "f", "p"], "((p=new Promise(" + this.createEffectfulFunction(["a", "b"], "s=a,f=b") + ")).s=s,p.f=f,p)");
      case 2:
        return this.createEffectfulFunction(["p", "d"], 'p.s(d),p.status="success",p.value=d;delete p.s;delete p.f');
      case 3:
        return this.createEffectfulFunction(["p", "d"], 'p.f(d),p.status="failure",p.value=d;delete p.s;delete p.f');
      case 4:
        return this.createFunction(["b", "a", "s", "l", "p", "f", "e", "n"], "(b=[],a=!0,s=!1,l=[],p=0,f=" + this.createEffectfulFunction(["v", "m", "x"], "for(x=0;x<p;x++)l[x]&&l[x][m](v)") + ",n=" + this.createEffectfulFunction(["o", "x", "z", "c"], 'for(x=0,z=b.length;x<z;x++)(c=b[x],(!a&&x===z-1)?o[s?"return":"throw"](c):o.next(c))') + ",e=" + this.createFunction(["o", "t"], "(a&&(l[t=p++]=o),n(o)," + this.createEffectfulFunction([], "a&&(l[t]=void 0)") + ")") + ",{__SEROVAL_STREAM__:!0,on:" + this.createFunction(["o"], "e(o)") + ",next:" + this.createEffectfulFunction(["v"], 'a&&(b.push(v),f(v,"next"))') + ",throw:" + this.createEffectfulFunction(["v"], 'a&&(b.push(v),f(v,"throw"),a=s=!1,l.length=0)') + ",return:" + this.createEffectfulFunction(["v"], 'a&&(b.push(v),f(v,"return"),a=!1,s=!0,l.length=0)') + "})");
      case 5:
        return this.createFunction(["a", "s"], "((s=(a=new AbortController).signal).a=a,s)");
      case 6:
        return this.createEffectfulFunction(["s", "r"], "s.a.abort(r);delete s.a");
      default:
        return "";
    }
  }
  serializeSpecialReference(e) {
    return this.assignIndexedValue(e.i, this.serializeSpecialReferenceValue(e.s));
  }
  serializeIteratorFactory(e) {
    let r = "", s = false;
    return e.f.t !== 4 && (this.markRef(e.f.i), r = "(" + this.serialize(e.f) + ",", s = true), r += this.assignIndexedValue(e.i, this.createFunction(["s"], this.createFunction(["i", "c", "d", "t"], "(i=0,t={[" + this.getRefParam(e.f.i) + "]:" + this.createFunction([], "t") + ",next:" + this.createEffectfulFunction([], "if(i>s.d)return{done:!0,value:void 0};if(d=s.v[c=i++],c===s.t)throw d;return{done:c===s.d,value:d}") + "})"))), s && (r += ")"), r;
  }
  serializeIteratorFactoryInstance(e) {
    return this.getConstructor(e.a[0]) + "(" + this.serialize(e.a[1]) + ")";
  }
  serializeAsyncIteratorFactory(e) {
    let r = e.a[0], s = e.a[1], n2 = "";
    r.t !== 4 && (this.markRef(r.i), n2 += "(" + this.serialize(r)), s.t !== 4 && (this.markRef(s.i), n2 += (n2 ? "," : "(") + this.serialize(s)), n2 && (n2 += ",");
    let a = this.assignIndexedValue(e.i, this.createFunction(["s"], this.createFunction(["b", "c", "p", "d", "e", "t", "f"], "(b=[],c=0,p=[],d=-1,e=!1,f=" + this.createEffectfulFunction(["i", "l"], "for(i=0,l=p.length;i<l;i++)p[i].s({done:!0,value:void 0})") + ",s.on({next:" + this.createEffectfulFunction(["v", "t"], "if(t=p.shift())t.s({done:!1,value:v});b.push(v)") + ",throw:" + this.createEffectfulFunction(["v", "t"], "if(t=p.shift())t.f(v);f(),d=b.length,e=!0,b.push(v)") + ",return:" + this.createEffectfulFunction(["v", "t"], "if(t=p.shift())t.s({done:!0,value:v});f(),d=b.length,b.push(v)") + "}),t={[" + this.getRefParam(s.i) + "]:" + this.createFunction([], "t") + ",next:" + this.createEffectfulFunction(["i", "t", "v"], "if(d===-1){return((i=c++)>=b.length)?(p.push(t=" + this.getRefParam(r.i) + "()),t):{done:!1,value:b[i]}}if(c>d)return{done:!0,value:void 0};if(v=b[i=c++],i!==d)return{done:!1,value:v};if(e)throw v;return{done:!0,value:v}") + "})")));
    return n2 ? n2 + a + ")" : a;
  }
  serializeAsyncIteratorFactoryInstance(e) {
    return this.getConstructor(e.a[0]) + "(" + this.serialize(e.a[1]) + ")";
  }
  serializeStreamConstructor(e) {
    let r = this.assignIndexedValue(e.i, this.getConstructor(e.f) + "()"), s = e.a.length;
    if (s) {
      let n2 = this.serialize(e.a[0]);
      for (let a = 1; a < s; a++) n2 += "," + this.serialize(e.a[a]);
      return "(" + r + "," + n2 + "," + this.getRefParam(e.i) + ")";
    }
    return r;
  }
  serializeStreamNext(e) {
    return this.getRefParam(e.i) + ".next(" + this.serialize(e.f) + ")";
  }
  serializeStreamThrow(e) {
    return this.getRefParam(e.i) + ".throw(" + this.serialize(e.f) + ")";
  }
  serializeStreamReturn(e) {
    return this.getRefParam(e.i) + ".return(" + this.serialize(e.f) + ")";
  }
  serializeAbortSignalSync(e) {
    return this.assignIndexedValue(e.i, "AbortSignal.abort(" + this.serialize(e.f) + ")");
  }
  serializeAbortSignalConstructor(e) {
    return this.assignIndexedValue(e.i, this.getConstructor(e.f) + "()");
  }
  serializeAbortSignalAbort(e) {
    return this.getConstructor(e.a[0]) + "(" + this.getRefParam(e.i) + "," + this.serialize(e.a[1]) + ")";
  }
  serialize(e) {
    try {
      switch (e.t) {
        case 2:
          return Ge[e.s];
        case 0:
          return "" + e.s;
        case 1:
          return '"' + e.s + '"';
        case 3:
          return e.s + "n";
        case 4:
          return this.getRefParam(e.i);
        case 18:
          return this.serializeReference(e);
        case 9:
          return this.serializeArray(e);
        case 10:
          return this.serializeObject(e);
        case 11:
          return this.serializeNullConstructor(e);
        case 5:
          return this.serializeDate(e);
        case 6:
          return this.serializeRegExp(e);
        case 7:
          return this.serializeSet(e);
        case 8:
          return this.serializeMap(e);
        case 19:
          return this.serializeArrayBuffer(e);
        case 16:
        case 15:
          return this.serializeTypedArray(e);
        case 20:
          return this.serializeDataView(e);
        case 14:
          return this.serializeAggregateError(e);
        case 13:
          return this.serializeError(e);
        case 12:
          return this.serializePromise(e);
        case 17:
          return this.serializeWellKnownSymbol(e);
        case 21:
          return this.serializeBoxed(e);
        case 22:
          return this.serializePromiseConstructor(e);
        case 23:
          return this.serializePromiseResolve(e);
        case 24:
          return this.serializePromiseReject(e);
        case 25:
          return this.serializePlugin(e);
        case 26:
          return this.serializeSpecialReference(e);
        case 27:
          return this.serializeIteratorFactory(e);
        case 28:
          return this.serializeIteratorFactoryInstance(e);
        case 29:
          return this.serializeAsyncIteratorFactory(e);
        case 30:
          return this.serializeAsyncIteratorFactoryInstance(e);
        case 31:
          return this.serializeStreamConstructor(e);
        case 32:
          return this.serializeStreamNext(e);
        case 33:
          return this.serializeStreamThrow(e);
        case 34:
          return this.serializeStreamReturn(e);
        case 36:
          return this.serializeAbortSignalAbort(e);
        case 35:
          return this.serializeAbortSignalConstructor(e);
        case 37:
          return this.serializeAbortSignalSync(e);
        default:
          throw new g(e);
      }
    } catch (r) {
      throw new Ce(r);
    }
  }
};
var T = class extends O {
  constructor(r) {
    super(r);
    this.mode = "cross";
    this.scopeId = r.scopeId;
  }
  getRefParam(r) {
    return Z + "[" + r + "]";
  }
  assignIndexedValue(r, s) {
    return this.getRefParam(r) + "=" + s;
  }
  serializeTop(r) {
    let s = this.serialize(r), n2 = r.i;
    if (n2 == null) return s;
    let a = this.resolvePatches(), i2 = this.getRefParam(n2), l2 = this.scopeId == null ? "" : Z, c = a ? "(" + s + "," + a + i2 + ")" : s;
    if (l2 === "") return r.t === 10 && !a ? "(" + c + ")" : c;
    let d2 = this.scopeId == null ? "()" : "(" + Z + '["' + p(this.scopeId) + '"])';
    return "(" + this.createFunction([l2], c) + ")" + d2;
  }
};
var b = class extends K {
  parseItems(e) {
    let r = [];
    for (let s = 0, n2 = e.length; s < n2; s++) s in e && (r[s] = this.parse(e[s]));
    return r;
  }
  parseArray(e, r) {
    return ye(e, r, this.parseItems(r));
  }
  parseProperties(e) {
    let r = Object.entries(e), s = [], n2 = [];
    for (let i2 = 0, l2 = r.length; i2 < l2; i2++) s.push(p(r[i2][0])), n2.push(this.parse(r[i2][1]));
    let a = Symbol.iterator;
    return a in e && (s.push(this.parseWellKnownSymbol(a)), n2.push(B(this.parseIteratorFactory(), this.parse(W(e))))), a = Symbol.asyncIterator, a in e && (s.push(this.parseWellKnownSymbol(a)), n2.push(j(this.parseAsyncIteratorFactory(), this.parse(L())))), a = Symbol.toStringTag, a in e && (s.push(this.parseWellKnownSymbol(a)), n2.push(w(e[a]))), a = Symbol.isConcatSpreadable, a in e && (s.push(this.parseWellKnownSymbol(a)), n2.push(e[a] ? x : I)), { k: s, v: n2, s: s.length };
  }
  parsePlainObject(e, r, s) {
    return this.createObjectNode(e, r, s, this.parseProperties(r));
  }
  parseBoxed(e, r) {
    return ve(e, this.parse(r.valueOf()));
  }
  parseTypedArray(e, r) {
    return be(e, r, this.parse(r.buffer));
  }
  parseBigIntTypedArray(e, r) {
    return Ne(e, r, this.parse(r.buffer));
  }
  parseDataView(e, r) {
    return Ae(e, r, this.parse(r.buffer));
  }
  parseError(e, r) {
    let s = V(r, this.features);
    return xe(e, r, s ? this.parseProperties(s) : t);
  }
  parseAggregateError(e, r) {
    let s = V(r, this.features);
    return Ie(e, r, s ? this.parseProperties(s) : t);
  }
  parseMap(e, r) {
    let s = [], n2 = [];
    for (let [a, i2] of r.entries()) s.push(this.parse(a)), n2.push(this.parse(i2));
    return this.createMapNode(e, s, n2, r.size);
  }
  parseSet(e, r) {
    let s = [];
    for (let n2 of r.keys()) s.push(this.parse(n2));
    return we(e, r.size, s);
  }
  parsePlugin(e, r) {
    let s = this.plugins;
    if (s) for (let n2 = 0, a = s.length; n2 < a; n2++) {
      let i2 = s[n2];
      if (i2.parse.sync && i2.test(r)) return D(e, i2.tag, i2.parse.sync(r, this, { id: e }));
    }
  }
  parseStream(e, r) {
    return _(e, this.parseSpecialReference(4), []);
  }
  parsePromise(e, r) {
    return this.createPromiseConstructorNode(e);
  }
  parseAbortSignalSync(e, r) {
    return u(37, e, t, t, t, t, t, t, t, this.parse(r.reason), t, t);
  }
  parseAbortSignal(e, r) {
    return r.aborted ? this.parseAbortSignalSync(e, r) : this.createAbortSignalConstructorNode(e);
  }
  parseObject(e, r) {
    if (Array.isArray(r)) return this.parseArray(e, r);
    if (Te(r)) return this.parseStream(e, r);
    let s = r.constructor;
    if (s === P) return this.parse(r.replacement);
    let n2 = this.parsePlugin(e, r);
    if (n2) return n2;
    switch (s) {
      case Object:
        return this.parsePlainObject(e, r, false);
      case void 0:
        return this.parsePlainObject(e, r, true);
      case Date:
        return Se(e, r);
      case RegExp:
        return ge(e, r);
      case Error:
      case EvalError:
      case RangeError:
      case ReferenceError:
      case SyntaxError:
      case TypeError:
      case URIError:
        return this.parseError(e, r);
      case Number:
      case Boolean:
      case String:
      case BigInt:
        return this.parseBoxed(e, r);
      case ArrayBuffer:
        return he(e, r);
      case Int8Array:
      case Int16Array:
      case Int32Array:
      case Uint8Array:
      case Uint16Array:
      case Uint32Array:
      case Uint8ClampedArray:
      case Float32Array:
      case Float64Array:
        return this.parseTypedArray(e, r);
      case DataView:
        return this.parseDataView(e, r);
      case Map:
        return this.parseMap(e, r);
      case Set:
        return this.parseSet(e, r);
      default:
        break;
    }
    if (s === Promise || r instanceof Promise) return this.parsePromise(e, r);
    let a = this.features;
    if (a & 32 && typeof AbortSignal != "undefined" && s === AbortSignal) return this.parseAbortSignal(e, r);
    if (a & 16) switch (s) {
      case BigInt64Array:
      case BigUint64Array:
        return this.parseBigIntTypedArray(e, r);
      default:
        break;
    }
    if (a & 1 && typeof AggregateError != "undefined" && (s === AggregateError || r instanceof AggregateError)) return this.parseAggregateError(e, r);
    if (r instanceof Error) return this.parseError(e, r);
    if (Symbol.iterator in r || Symbol.asyncIterator in r) return this.parsePlainObject(e, r, !!s);
    throw new S(r);
  }
  parseFunction(e) {
    let r = this.getReference(e);
    if (r.type !== 0) return r.value;
    let s = this.parsePlugin(r.value, e);
    if (s) return s;
    throw new S(e);
  }
  parse(e) {
    try {
      switch (typeof e) {
        case "boolean":
          return e ? x : I;
        case "undefined":
          return ce;
        case "string":
          return w(e);
        case "number":
          return fe(e);
        case "bigint":
          return me(e);
        case "object": {
          if (e) {
            let r = this.getReference(e);
            return r.type === 0 ? this.parseObject(r.value, e) : r.value;
          }
          return ue;
        }
        case "symbol":
          return this.parseWellKnownSymbol(e);
        case "function":
          return this.parseFunction(e);
        default:
          throw new S(e);
      }
    } catch (r) {
      throw new M(r);
    }
  }
};
var te = class extends b {
  constructor(r) {
    super(r);
    this.alive = true;
    this.pending = 0;
    this.initial = true;
    this.buffer = [];
    this.onParseCallback = r.onParse, this.onErrorCallback = r.onError, this.onDoneCallback = r.onDone;
  }
  onParseInternal(r, s) {
    try {
      this.onParseCallback(r, s);
    } catch (n2) {
      this.onError(n2);
    }
  }
  flush() {
    for (let r = 0, s = this.buffer.length; r < s; r++) this.onParseInternal(this.buffer[r], false);
  }
  onParse(r) {
    this.initial ? this.buffer.push(r) : this.onParseInternal(r, false);
  }
  onError(r) {
    if (this.onErrorCallback) this.onErrorCallback(r);
    else throw r;
  }
  onDone() {
    this.onDoneCallback && this.onDoneCallback();
  }
  pushPendingState() {
    this.pending++;
  }
  popPendingState() {
    --this.pending <= 0 && this.onDone();
  }
  parseProperties(r) {
    let s = Object.entries(r), n2 = [], a = [];
    for (let l2 = 0, c = s.length; l2 < c; l2++) n2.push(p(s[l2][0])), a.push(this.parse(s[l2][1]));
    let i2 = Symbol.iterator;
    return i2 in r && (n2.push(this.parseWellKnownSymbol(i2)), a.push(B(this.parseIteratorFactory(), this.parse(W(r))))), i2 = Symbol.asyncIterator, i2 in r && (n2.push(this.parseWellKnownSymbol(i2)), a.push(j(this.parseAsyncIteratorFactory(), this.parse(ke(r))))), i2 = Symbol.toStringTag, i2 in r && (n2.push(this.parseWellKnownSymbol(i2)), a.push(w(r[i2]))), i2 = Symbol.isConcatSpreadable, i2 in r && (n2.push(this.parseWellKnownSymbol(i2)), a.push(r[i2] ? x : I)), { k: n2, v: a, s: n2.length };
  }
  parsePromise(r, s) {
    return s.then((n2) => {
      let a = this.parseWithError(n2);
      a && this.onParse(u(23, r, t, t, t, t, t, t, [this.parseSpecialReference(2), a], t, t, t)), this.popPendingState();
    }, (n2) => {
      if (this.alive) {
        let a = this.parseWithError(n2);
        a && this.onParse(u(24, r, t, t, t, t, t, t, [this.parseSpecialReference(3), a], t, t, t));
      }
      this.popPendingState();
    }), this.pushPendingState(), this.createPromiseConstructorNode(r);
  }
  parsePlugin(r, s) {
    let n2 = this.plugins;
    if (n2) for (let a = 0, i2 = n2.length; a < i2; a++) {
      let l2 = n2[a];
      if (l2.parse.stream && l2.test(s)) return D(r, l2.tag, l2.parse.stream(s, this, { id: r }));
    }
    return t;
  }
  parseStream(r, s) {
    let n2 = _(r, this.parseSpecialReference(4), []);
    return this.pushPendingState(), s.on({ next: (a) => {
      if (this.alive) {
        let i2 = this.parseWithError(a);
        i2 && this.onParse(Ee(r, i2));
      }
    }, throw: (a) => {
      if (this.alive) {
        let i2 = this.parseWithError(a);
        i2 && this.onParse(Re(r, i2));
      }
      this.popPendingState();
    }, return: (a) => {
      if (this.alive) {
        let i2 = this.parseWithError(a);
        i2 && this.onParse(Pe(r, i2));
      }
      this.popPendingState();
    } }), n2;
  }
  handleAbortSignal(r, s) {
    if (this.alive) {
      let n2 = this.parseWithError(s.reason);
      n2 && this.onParse(u(36, r, t, t, t, t, t, t, [this.parseSpecialReference(6), n2], t, t, t));
    }
    this.popPendingState();
  }
  parseAbortSignal(r, s) {
    return s.aborted ? this.parseAbortSignalSync(r, s) : (this.pushPendingState(), s.addEventListener("abort", this.handleAbortSignal.bind(this, r, s), { once: true }), this.createAbortSignalConstructorNode(r));
  }
  parseWithError(r) {
    try {
      return this.parse(r);
    } catch (s) {
      return this.onError(s), t;
    }
  }
  start(r) {
    let s = this.parseWithError(r);
    s && (this.onParseInternal(s, true), this.initial = false, this.flush(), this.pending <= 0 && this.destroy());
  }
  destroy() {
    this.alive && (this.onDone(), this.alive = false);
  }
  isAlive() {
    return this.alive;
  }
};
var Y = class extends te {
  constructor() {
    super(...arguments);
    this.mode = "cross";
  }
};
function fr(o2, e) {
  let r = f(e.plugins), s = new Y({ plugins: r, refs: e.refs, disabledFeatures: e.disabledFeatures, onParse(n2, a) {
    let i2 = new T({ plugins: r, features: s.features, scopeId: e.scopeId, markedRefs: s.marked }), l2;
    try {
      l2 = i2.serializeTop(n2);
    } catch (c) {
      e.onError && e.onError(c);
      return;
    }
    e.onSerialize(l2, a);
  }, onError: e.onError, onDone: e.onDone });
  return s.start(o2), s.destroy.bind(s);
}
var gr = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_";
var mr = gr.length;
var hr = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_";
var Sr = hr.length;
var Ve = class {
  constructor(e) {
    this.options = e;
    this.alive = true;
    this.flushed = false;
    this.done = false;
    this.pending = 0;
    this.cleanups = [];
    this.refs = /* @__PURE__ */ new Map();
    this.keys = /* @__PURE__ */ new Set();
    this.ids = 0;
    this.plugins = f(e.plugins);
  }
  write(e, r) {
    this.alive && !this.flushed && (this.pending++, this.keys.add(e), this.cleanups.push(fr(r, { plugins: this.plugins, scopeId: this.options.scopeId, refs: this.refs, disabledFeatures: this.options.disabledFeatures, onError: this.options.onError, onSerialize: (s, n2) => {
      this.alive && this.options.onData(n2 ? this.options.globalIdentifier + '["' + p(e) + '"]=' + s : s);
    }, onDone: () => {
      this.alive && (this.pending--, this.pending <= 0 && this.flushed && !this.done && this.options.onDone && (this.options.onDone(), this.done = true));
    } })));
  }
  getNextID() {
    for (; this.keys.has("" + this.ids); ) this.ids++;
    return "" + this.ids;
  }
  push(e) {
    let r = this.getNextID();
    return this.write(r, e), r;
  }
  flush() {
    this.alive && (this.flushed = true, this.pending <= 0 && !this.done && this.options.onDone && (this.options.onDone(), this.done = true));
  }
  close() {
    if (this.alive) {
      for (let e = 0, r = this.cleanups.length; e < r; e++) this.cleanups[e]();
      !this.done && this.options.onDone && (this.options.onDone(), this.done = true), this.alive = false;
    }
  }
};

// node_modules/.pnpm/seroval-plugins@1.2.1_seroval@1.2.1/node_modules/seroval-plugins/dist/esm/production/web.mjs
var P2 = Yr({ tag: "seroval-plugins/web/Blob", test(e) {
  return typeof Blob == "undefined" ? false : e instanceof Blob;
}, parse: { async async(e, r) {
  return { type: await r.parse(e.type), buffer: await r.parse(await e.arrayBuffer()) };
} }, serialize(e, r) {
  return "new Blob([" + r.serialize(e.buffer) + "],{type:" + r.serialize(e.type) + "})";
}, deserialize(e, r) {
  return new Blob([r.deserialize(e.buffer)], { type: r.deserialize(e.type) });
} });
function p2(e) {
  return { detail: e.detail, bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var E2 = Yr({ tag: "seroval-plugins/web/CustomEvent", test(e) {
  return typeof CustomEvent == "undefined" ? false : e instanceof CustomEvent;
}, parse: { sync(e, r) {
  return { type: r.parse(e.type), options: r.parse(p2(e)) };
}, async async(e, r) {
  return { type: await r.parse(e.type), options: await r.parse(p2(e)) };
}, stream(e, r) {
  return { type: r.parse(e.type), options: r.parse(p2(e)) };
} }, serialize(e, r) {
  return "new CustomEvent(" + r.serialize(e.type) + "," + r.serialize(e.options) + ")";
}, deserialize(e, r) {
  return new CustomEvent(r.deserialize(e.type), r.deserialize(e.options));
} });
var F2 = E2;
var I2 = Yr({ tag: "seroval-plugins/web/DOMException", test(e) {
  return typeof DOMException == "undefined" ? false : e instanceof DOMException;
}, parse: { sync(e, r) {
  return { name: r.parse(e.name), message: r.parse(e.message) };
}, async async(e, r) {
  return { name: await r.parse(e.name), message: await r.parse(e.message) };
}, stream(e, r) {
  return { name: r.parse(e.name), message: r.parse(e.message) };
} }, serialize(e, r) {
  return "new DOMException(" + r.serialize(e.message) + "," + r.serialize(e.name) + ")";
}, deserialize(e, r) {
  return new DOMException(r.deserialize(e.message), r.deserialize(e.name));
} });
var B2 = I2;
function u2(e) {
  return { bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var L2 = Yr({ tag: "seroval-plugins/web/Event", test(e) {
  return typeof Event == "undefined" ? false : e instanceof Event;
}, parse: { sync(e, r) {
  return { type: r.parse(e.type), options: r.parse(u2(e)) };
}, async async(e, r) {
  return { type: await r.parse(e.type), options: await r.parse(u2(e)) };
}, stream(e, r) {
  return { type: r.parse(e.type), options: r.parse(u2(e)) };
} }, serialize(e, r) {
  return "new Event(" + r.serialize(e.type) + "," + r.serialize(e.options) + ")";
}, deserialize(e, r) {
  return new Event(r.deserialize(e.type), r.deserialize(e.options));
} });
var O2 = L2;
var q = Yr({ tag: "seroval-plugins/web/File", test(e) {
  return typeof File == "undefined" ? false : e instanceof File;
}, parse: { async async(e, r) {
  return { name: await r.parse(e.name), options: await r.parse({ type: e.type, lastModified: e.lastModified }), buffer: await r.parse(await e.arrayBuffer()) };
} }, serialize(e, r) {
  return "new File([" + r.serialize(e.buffer) + "]," + r.serialize(e.name) + "," + r.serialize(e.options) + ")";
}, deserialize(e, r) {
  return new File([r.deserialize(e.buffer)], r.deserialize(e.name), r.deserialize(e.options));
} });
var d = q;
function f2(e) {
  let r = [];
  return e.forEach((s, a) => {
    r.push([a, s]);
  }), r;
}
var n = {};
var H = Yr({ tag: "seroval-plugins/web/FormDataFactory", test(e) {
  return e === n;
}, parse: { sync() {
}, async async() {
  return await Promise.resolve(void 0);
}, stream() {
} }, serialize(e, r) {
  return r.createEffectfulFunction(["e", "f", "i", "s", "t"], "f=new FormData;for(i=0,s=e.length;i<s;i++)f.append((t=e[i])[0],t[1]);return f");
}, deserialize() {
  return n;
} });
var M2 = Yr({ tag: "seroval-plugins/web/FormData", extends: [d, H], test(e) {
  return typeof FormData == "undefined" ? false : e instanceof FormData;
}, parse: { sync(e, r) {
  return { factory: r.parse(n), entries: r.parse(f2(e)) };
}, async async(e, r) {
  return { factory: await r.parse(n), entries: await r.parse(f2(e)) };
}, stream(e, r) {
  return { factory: r.parse(n), entries: r.parse(f2(e)) };
} }, serialize(e, r) {
  return "(" + r.serialize(e.factory) + ")(" + r.serialize(e.entries) + ")";
}, deserialize(e, r) {
  let s = new FormData(), a = r.deserialize(e.entries);
  for (let t2 = 0, b2 = a.length; t2 < b2; t2++) {
    let c = a[t2];
    s.append(c[0], c[1]);
  }
  return s;
} });
var A2 = M2;
function m2(e) {
  let r = [];
  return e.forEach((s, a) => {
    r.push([a, s]);
  }), r;
}
var _2 = Yr({ tag: "seroval-plugins/web/Headers", test(e) {
  return typeof Headers == "undefined" ? false : e instanceof Headers;
}, parse: { sync(e, r) {
  return r.parse(m2(e));
}, async async(e, r) {
  return await r.parse(m2(e));
}, stream(e, r) {
  return r.parse(m2(e));
} }, serialize(e, r) {
  return "new Headers(" + r.serialize(e) + ")";
}, deserialize(e, r) {
  return new Headers(r.deserialize(e));
} });
var i = _2;
var j2 = Yr({ tag: "seroval-plugins/web/ImageData", test(e) {
  return typeof ImageData == "undefined" ? false : e instanceof ImageData;
}, parse: { sync(e, r) {
  return { data: r.parse(e.data), width: r.parse(e.width), height: r.parse(e.height), options: r.parse({ colorSpace: e.colorSpace }) };
}, async async(e, r) {
  return { data: await r.parse(e.data), width: await r.parse(e.width), height: await r.parse(e.height), options: await r.parse({ colorSpace: e.colorSpace }) };
}, stream(e, r) {
  return { data: r.parse(e.data), width: r.parse(e.width), height: r.parse(e.height), options: r.parse({ colorSpace: e.colorSpace }) };
} }, serialize(e, r) {
  return "new ImageData(" + r.serialize(e.data) + "," + r.serialize(e.width) + "," + r.serialize(e.height) + "," + r.serialize(e.options) + ")";
}, deserialize(e, r) {
  return new ImageData(r.deserialize(e.data), r.deserialize(e.width), r.deserialize(e.height), r.deserialize(e.options));
} });
var o = {};
var V2 = Yr({ tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === o;
}, parse: { sync() {
}, async async() {
  return await Promise.resolve(void 0);
}, stream() {
} }, serialize(e, r) {
  return r.createFunction(["d"], "new ReadableStream({start:" + r.createEffectfulFunction(["c"], "d.on({next:" + r.createEffectfulFunction(["v"], "c.enqueue(v)") + ",throw:" + r.createEffectfulFunction(["v"], "c.error(v)") + ",return:" + r.createEffectfulFunction([], "c.close()") + "})") + "})");
}, deserialize() {
  return o;
} });
function g2(e) {
  let r = L(), s = e.getReader();
  async function a() {
    try {
      let t2 = await s.read();
      t2.done ? r.return(t2.value) : (r.next(t2.value), await a());
    } catch (t2) {
      r.throw(t2);
    }
  }
  return a().catch(() => {
  }), r;
}
var G = Yr({ tag: "seroval/plugins/web/ReadableStream", extends: [V2], test(e) {
  return typeof ReadableStream == "undefined" ? false : e instanceof ReadableStream;
}, parse: { sync(e, r) {
  return { factory: r.parse(o), stream: r.parse(L()) };
}, async async(e, r) {
  return { factory: await r.parse(o), stream: await r.parse(g2(e)) };
}, stream(e, r) {
  return { factory: r.parse(o), stream: r.parse(g2(e)) };
} }, serialize(e, r) {
  return "(" + r.serialize(e.factory) + ")(" + r.serialize(e.stream) + ")";
}, deserialize(e, r) {
  let s = r.deserialize(e.stream);
  return new ReadableStream({ start(a) {
    s.on({ next(t2) {
      a.enqueue(t2);
    }, throw(t2) {
      a.error(t2);
    }, return() {
      a.close();
    } });
  } });
} });
var l = G;
function z(e, r) {
  return { body: r, cache: e.cache, credentials: e.credentials, headers: e.headers, integrity: e.integrity, keepalive: e.keepalive, method: e.method, mode: e.mode, redirect: e.redirect, referrer: e.referrer, referrerPolicy: e.referrerPolicy };
}
var K2 = Yr({ tag: "seroval-plugins/web/Request", extends: [l, i], test(e) {
  return typeof Request == "undefined" ? false : e instanceof Request;
}, parse: { async async(e, r) {
  return { url: await r.parse(e.url), options: await r.parse(z(e, e.body ? await e.clone().arrayBuffer() : null)) };
}, stream(e, r) {
  return { url: r.parse(e.url), options: r.parse(z(e, e.clone().body)) };
} }, serialize(e, r) {
  return "new Request(" + r.serialize(e.url) + "," + r.serialize(e.options) + ")";
}, deserialize(e, r) {
  return new Request(r.deserialize(e.url), r.deserialize(e.options));
} });
var Q = K2;
function S2(e) {
  return { headers: e.headers, status: e.status, statusText: e.statusText };
}
var X2 = Yr({ tag: "seroval-plugins/web/Response", extends: [l, i], test(e) {
  return typeof Response == "undefined" ? false : e instanceof Response;
}, parse: { async async(e, r) {
  return { body: await r.parse(e.body ? await e.clone().arrayBuffer() : null), options: await r.parse(S2(e)) };
}, stream(e, r) {
  return { body: r.parse(e.clone().body), options: r.parse(S2(e)) };
} }, serialize(e, r) {
  return "new Response(" + r.serialize(e.body) + "," + r.serialize(e.options) + ")";
}, deserialize(e, r) {
  return new Response(r.deserialize(e.body), r.deserialize(e.options));
} });
var Z2 = X2;
var x2 = Yr({ tag: "seroval-plugins/web/URLSearchParams", test(e) {
  return typeof URLSearchParams == "undefined" ? false : e instanceof URLSearchParams;
}, parse: { sync(e, r) {
  return r.parse(e.toString());
}, async async(e, r) {
  return await r.parse(e.toString());
}, stream(e, r) {
  return r.parse(e.toString());
} }, serialize(e, r) {
  return "new URLSearchParams(" + r.serialize(e) + ")";
}, deserialize(e, r) {
  return new URLSearchParams(r.deserialize(e));
} });
var ee = x2;
var ae = Yr({ tag: "seroval-plugins/web/URL", test(e) {
  return typeof URL == "undefined" ? false : e instanceof URL;
}, parse: { sync(e, r) {
  return r.parse(e.href);
}, async async(e, r) {
  return await r.parse(e.href);
}, stream(e, r) {
  return r.parse(e.href);
} }, serialize(e, r) {
  return "new URL(" + r.serialize(e) + ")";
}, deserialize(e, r) {
  return new URL(r.deserialize(e));
} });
var te2 = ae;

// node_modules/.pnpm/solid-js@1.9.5/node_modules/solid-js/web/dist/server.js
var booleans = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "hidden",
  "indeterminate",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected"
];
var Properties = /* @__PURE__ */ new Set([
  "className",
  "value",
  "readOnly",
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  ...booleans
]);
var ES2017FLAG = F.AggregateError | F.BigIntTypedArray;
var GLOBAL_IDENTIFIER = "_$HY.r";
function createSerializer({ onData, onDone, scopeId, onError }) {
  return new Ve({
    scopeId,
    plugins: [
      F2,
      B2,
      O2,
      A2,
      i,
      l,
      Q,
      Z2,
      ee,
      te2
    ],
    globalIdentifier: GLOBAL_IDENTIFIER,
    disabledFeatures: ES2017FLAG,
    onData,
    onDone,
    onError
  });
}
function getLocalHeaderScript(id) {
  return br(id) + ";";
}
var REPLACE_SCRIPT = `function $df(e,n,o,t){if(n=document.getElementById(e),o=document.getElementById("pl-"+e)){for(;o&&8!==o.nodeType&&o.nodeValue!=="pl-"+e;)t=o.nextSibling,o.remove(),o=t;_$HY.done?o.remove():o.replaceWith(n.content)}n.remove(),_$HY.fe(e)}`;
function renderToStringAsync(code, options = {}) {
  const { timeoutMs = 3e4 } = options;
  let timeoutHandle;
  const timeout = new Promise((_3, reject) => {
    timeoutHandle = setTimeout(() => reject("renderToString timed out"), timeoutMs);
  });
  return Promise.race([renderToStream(code, options), timeout]).then((html) => {
    clearTimeout(timeoutHandle);
    return html;
  });
}
function renderToStream(code, options = {}) {
  let { nonce, onCompleteShell, onCompleteAll, renderId, noScripts } = options;
  let dispose;
  const blockingPromises = [];
  const pushTask = (task) => {
    if (noScripts) return;
    if (!tasks && !firstFlushed) {
      tasks = getLocalHeaderScript(renderId);
    }
    tasks += task + ";";
    if (!timer && firstFlushed) {
      timer = setTimeout(writeTasks);
    }
  };
  const onDone = () => {
    writeTasks();
    doShell();
    onCompleteAll && onCompleteAll({
      write(v) {
        !completed && buffer.write(v);
      }
    });
    writable && writable.end();
    completed = true;
    if (firstFlushed) dispose();
  };
  const serializer = createSerializer({
    scopeId: options.renderId,
    onData: pushTask,
    onDone,
    onError: options.onError
  });
  const flushEnd = () => {
    if (!registry.size) {
      queue(() => queue(() => serializer.flush()));
    }
  };
  const registry = /* @__PURE__ */ new Map();
  const writeTasks = () => {
    if (tasks.length && !completed && firstFlushed) {
      buffer.write(`<script${nonce ? ` nonce="${nonce}"` : ""}>${tasks}</script>`);
      tasks = "";
    }
    timer && clearTimeout(timer);
    timer = null;
  };
  let context;
  let writable;
  let tmp = "";
  let tasks = "";
  let firstFlushed = false;
  let completed = false;
  let shellCompleted = false;
  let scriptFlushed = false;
  let timer = null;
  let buffer = {
    write(payload) {
      tmp += payload;
    }
  };
  sharedConfig.context = context = {
    id: renderId || "",
    count: 0,
    async: true,
    resources: {},
    lazy: {},
    suspense: {},
    assets: [],
    nonce,
    block(p3) {
      if (!firstFlushed) blockingPromises.push(p3);
    },
    replace(id, payloadFn) {
      if (firstFlushed) return;
      const placeholder = `<!--!$${id}-->`;
      const first = html.indexOf(placeholder);
      if (first === -1) return;
      const last = html.indexOf(`<!--!$/${id}-->`, first + placeholder.length);
      html = html.slice(0, first) + resolveSSRNode(escape(payloadFn())) + html.slice(last + placeholder.length + 1);
    },
    serialize(id, p3, wait) {
      const serverOnly = sharedConfig.context.noHydrate;
      if (!firstFlushed && wait && typeof p3 === "object" && "then" in p3) {
        blockingPromises.push(p3);
        !serverOnly && p3.then((d2) => {
          serializer.write(id, d2);
        }).catch((e) => {
          serializer.write(id, e);
        });
      } else if (!serverOnly) serializer.write(id, p3);
    },
    roots: 0,
    nextRoot() {
      return this.renderId + "i-" + this.roots++;
    },
    registerFragment(key) {
      if (!registry.has(key)) {
        let resolve, reject;
        const p3 = new Promise((r, rej) => (resolve = r, reject = rej));
        registry.set(
          key,
          (err) => queue(
            () => queue(() => {
              err ? reject(err) : resolve(true);
              queue(flushEnd);
            })
          )
        );
        serializer.write(key, p3);
      }
      return (value, error) => {
        if (registry.has(key)) {
          const resolve = registry.get(key);
          registry.delete(key);
          if (waitForFragments(registry, key)) {
            resolve();
            return;
          }
          if (!completed) {
            if (!firstFlushed) {
              queue(() => html = replacePlaceholder(html, key, value !== void 0 ? value : ""));
              resolve(error);
            } else {
              buffer.write(`<template id="${key}">${value !== void 0 ? value : " "}</template>`);
              pushTask(`$df("${key}")${!scriptFlushed ? ";" + REPLACE_SCRIPT : ""}`);
              resolve(error);
              scriptFlushed = true;
            }
          }
        }
        return firstFlushed;
      };
    }
  };
  let html = createRoot((d2) => {
    dispose = d2;
    return resolveSSRNode(escape(code()));
  });
  function doShell() {
    if (shellCompleted) return;
    sharedConfig.context = context;
    context.noHydrate = true;
    html = injectAssets(context.assets, html);
    if (tasks.length) html = injectScripts(html, tasks, nonce);
    buffer.write(html);
    tasks = "";
    onCompleteShell && onCompleteShell({
      write(v) {
        !completed && buffer.write(v);
      }
    });
    shellCompleted = true;
  }
  return {
    then(fn) {
      function complete() {
        dispose();
        fn(tmp);
      }
      if (onCompleteAll) {
        let ogComplete = onCompleteAll;
        onCompleteAll = (options2) => {
          ogComplete(options2);
          complete();
        };
      } else onCompleteAll = complete;
      queue(flushEnd);
    },
    pipe(w2) {
      allSettled(blockingPromises).then(() => {
        setTimeout(() => {
          doShell();
          buffer = writable = w2;
          buffer.write(tmp);
          firstFlushed = true;
          if (completed) {
            dispose();
            writable.end();
          } else flushEnd();
        });
      });
    },
    pipeTo(w2) {
      return allSettled(blockingPromises).then(() => {
        let resolve;
        const p3 = new Promise((r) => resolve = r);
        setTimeout(() => {
          doShell();
          const encoder = new TextEncoder();
          const writer = w2.getWriter();
          writable = {
            end() {
              writer.releaseLock();
              w2.close();
              resolve();
            }
          };
          buffer = {
            write(payload) {
              writer.write(encoder.encode(payload));
            }
          };
          buffer.write(tmp);
          firstFlushed = true;
          if (completed) {
            dispose();
            writable.end();
          } else flushEnd();
        });
        return p3;
      });
    }
  };
}
function ssr(t2, ...nodes) {
  if (nodes.length) {
    let result = "";
    for (let i2 = 0; i2 < nodes.length; i2++) {
      result += t2[i2];
      const node = nodes[i2];
      if (node !== void 0) result += resolveSSRNode(node);
    }
    t2 = result + t2[nodes.length];
  }
  return {
    t: t2
  };
}
function ssrAttribute(key, value, isBoolean) {
  return isBoolean ? value ? " " + key : "" : value != null ? ` ${key}="${value}"` : "";
}
function escape(s, attr) {
  const t2 = typeof s;
  if (t2 !== "string") {
    if (!attr && t2 === "function") return escape(s());
    if (!attr && Array.isArray(s)) {
      for (let i2 = 0; i2 < s.length; i2++) s[i2] = escape(s[i2]);
      return s;
    }
    if (attr && t2 === "boolean") return String(s);
    return s;
  }
  const delim = attr ? '"' : "<";
  const escDelim = attr ? "&quot;" : "&lt;";
  let iDelim = s.indexOf(delim);
  let iAmp = s.indexOf("&");
  if (iDelim < 0 && iAmp < 0) return s;
  let left = 0, out = "";
  while (iDelim >= 0 && iAmp >= 0) {
    if (iDelim < iAmp) {
      if (left < iDelim) out += s.substring(left, iDelim);
      out += escDelim;
      left = iDelim + 1;
      iDelim = s.indexOf(delim, left);
    } else {
      if (left < iAmp) out += s.substring(left, iAmp);
      out += "&amp;";
      left = iAmp + 1;
      iAmp = s.indexOf("&", left);
    }
  }
  if (iDelim >= 0) {
    do {
      if (left < iDelim) out += s.substring(left, iDelim);
      out += escDelim;
      left = iDelim + 1;
      iDelim = s.indexOf(delim, left);
    } while (iDelim >= 0);
  } else
    while (iAmp >= 0) {
      if (left < iAmp) out += s.substring(left, iAmp);
      out += "&amp;";
      left = iAmp + 1;
      iAmp = s.indexOf("&", left);
    }
  return left < s.length ? out + s.substring(left) : out;
}
function resolveSSRNode(node, top) {
  const t2 = typeof node;
  if (t2 === "string") return node;
  if (node == null || t2 === "boolean") return "";
  if (Array.isArray(node)) {
    let prev = {};
    let mapped = "";
    for (let i2 = 0, len = node.length; i2 < len; i2++) {
      if (!top && typeof prev !== "object" && typeof node[i2] !== "object") mapped += `<!--!$-->`;
      mapped += resolveSSRNode(prev = node[i2]);
    }
    return mapped;
  }
  if (t2 === "object") return node.t;
  if (t2 === "function") return resolveSSRNode(node());
  return String(node);
}
function NoHydration(props) {
  if (sharedConfig.context) sharedConfig.context.noHydrate = true;
  return props.children;
}
function queue(fn) {
  return Promise.resolve().then(fn);
}
function allSettled(promises) {
  let length = promises.length;
  return Promise.allSettled(promises).then(() => {
    if (promises.length !== length) return allSettled(promises);
    return;
  });
}
function injectAssets(assets, html) {
  if (!assets || !assets.length) return html;
  let out = "";
  for (let i2 = 0, len = assets.length; i2 < len; i2++) out += assets[i2]();
  const index = html.indexOf("</head>");
  if (index === -1) return html;
  return html.slice(0, index) + out + html.slice(index);
}
function injectScripts(html, scripts, nonce) {
  const tag = `<script${nonce ? ` nonce="${nonce}"` : ""}>${scripts}</script>`;
  const index = html.indexOf("<!--xs-->");
  if (index > -1) {
    return html.slice(0, index) + tag + html.slice(index);
  }
  return html + tag;
}
function waitForFragments(registry, key) {
  for (const k of [...registry.keys()].reverse()) {
    if (key.startsWith(k)) return true;
  }
  return false;
}
function replacePlaceholder(html, key, value) {
  const marker = `<template id="pl-${key}">`;
  const close = `<!--pl-${key}-->`;
  const first = html.indexOf(marker);
  if (first === -1) return html;
  const last = html.indexOf(close, first + marker.length);
  return html.slice(0, first) + value + html.slice(last + close.length);
}
var RequestContext = Symbol();
var isServer = true;

// src/youlog_lib/core/i18n.ts
var DEFAULT_LANG = "en";
function getCurrentLang() {
  if (isServer) {
    if (typeof everkm === "undefined") {
      return DEFAULT_LANG;
    }
    return everkm.lang();
  }
  return document.documentElement.lang || DEFAULT_LANG;
}

// src/youlog_lib/widgets/katex/ssr.tsx
var _tmpl$ = ['<link rel="stylesheet" href="', '">'];
var _tmpl$2 = ['<script defer src="', '"></script>'];
var Katex = (props) => {
  let {
    isCN = false
  } = props;
  if (!isCN && typeof props.isCN === "undefined" && !props.disableDetectCN) {
    const lang = getCurrentLang().toLowerCase().replace("_", "-");
    isCN = lang === "zh" || lang.startsWith("zh-");
  }
  const cdnHost = isCN ? "cdn.jsdmirror.com" : "cdn.jsdelivr.net";
  return [ssr(_tmpl$, `https://${escape(cdnHost, true)}/npm/katex@0.16.9/dist/katex.min.css`), ssr(_tmpl$2, `https://${escape(cdnHost, true)}/npm/katex@0.16.9/dist/katex.min.js`), ssr(_tmpl$2, `https://${escape(cdnHost, true)}/npm/katex@0.16.9/dist/contrib/auto-render.min.js`)];
};

// src/youlog_lib/widgets/prism/ssr.tsx
var _tmpl$3 = ['<link rel="stylesheet" href="', '">'];
var _tmpl$22 = ['<script src="', '"></script>'];
var _tmpl$32 = ["<script>", "</script>"];
var Prism = (props) => {
  let {
    isCN = false
  } = props;
  if (!isCN && typeof props.isCN === "undefined" && !props.disableDetectCN) {
    const lang = getCurrentLang().toLowerCase().replace("_", "-");
    isCN = lang === "zh" || lang.startsWith("zh-");
  }
  const cdnHost = isCN ? "cdn.jsdmirror.com" : "cdn.jsdelivr.net";
  return [ssr(_tmpl$3, `https://${escape(cdnHost, true)}/combine/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css,npm/prismjs@1.30.0/plugins/toolbar/prism-toolbar.min.css`), ssr(_tmpl$22, `https://${escape(cdnHost, true)}/combine/npm/prismjs@1.30.0/components/prism-core.min.js,npm/prismjs@1.30.0/plugins/autoloader/prism-autoloader.min.js,npm/prismjs@1.30.0/plugins/toolbar/prism-toolbar.min.js,npm/prismjs@1.30.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js`), ssr(_tmpl$32, `Prism.plugins.autoloader.languages_path = "https://${cdnHost}/npm/prismjs@1.30.0/components/";`)];
};

// src/utils/index.ts
var import_dayjs = __toESM(require_dayjs_min(), 1);
function formatDate(timestamp, format = "YYYY-MM-DD") {
  if (!timestamp) return "";
  return import_dayjs.default.unix(timestamp).format(format);
}
function getConfigValue(config, path, defaultValue = void 0) {
  const keys = path.split(".");
  let value = config;
  for (const key of keys) {
    value = value?.[key];
    if (value === void 0) return defaultValue;
  }
  return value;
}
function coerceBoolean(value, defaultValue) {
  if (value === void 0 || value === null) return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
  }
  return Boolean(value);
}
function getDisplayFlag(config, docMeta, key, defaultValue = true) {
  if (docMeta && docMeta[key] !== void 0 && docMeta[key] !== null) {
    return coerceBoolean(docMeta[key], defaultValue);
  }
  return coerceBoolean(
    getConfigValue(config, `layout.${key}`, defaultValue),
    defaultValue
  );
}

// src/utils/ajaxLayout.ts
function buildAjaxLayoutFingerprint(input) {
  const { page, stack = false, hasNav = false, config } = input;
  return [
    `page=${page}`,
    `stack=${stack ? 1 : 0}`,
    `nav=${hasNav ? 1 : 0}`,
    `sidebar_header=${getConfigValue(config, "layout.aisde_no_header", false) ? 0 : 1}`,
    `only_logo=${getConfigValue(config, "layout.only_display_logo", false) ? 1 : 0}`,
    `algolia=${getConfigValue(config, "algolia_search") ? 1 : 0}`,
    `header_nav=${getConfigValue(config, "header_nav") ? 1 : 0}`
  ].join("|");
}
function buildAjaxDocFingerprint(config, docMeta) {
  return [
    `print=${getDisplayFlag(config, docMeta, "print", true) ? 1 : 0}`,
    `qrcode=${getDisplayFlag(config, docMeta, "page_qrcode", true) ? 1 : 0}`
  ].join("|");
}
function buildAjaxPageFingerprint(input) {
  return `${buildAjaxLayoutFingerprint(input)};${buildAjaxDocFingerprint(input.config, input.docMeta)}`;
}
function buildAjaxHeadFingerprint(config) {
  const features = config.features || {};
  const codeHighlight = features.code_highlight ?? true;
  const katexFormula = features.katex_formula ?? false;
  const customCss = config.custom_css ? "1" : "0";
  return [
    `code=${codeHighlight ? 1 : 0}`,
    `katex=${katexFormula ? 1 : 0}`,
    `custom_css=${customCss}`
  ].join("|");
}

// src/layout/RootLayout.tsx
var _tmpl$4 = ['<link rel="stylesheet"', ">"];
var _tmpl$23 = ['<meta name="theme-color"', ">"];
var _tmpl$33 = ['<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title data-ajax-element="title">', '</title><meta name="description"', '><meta name="keywords"', '><meta name="generator" content="', '"><meta name="theme" content="', '">', "", "<script>", "</script>", "", "</head>"];
var _tmpl$42 = ["<html", ' class="light"', ">", '<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">', "</body></html>"];
var RootLayout = (props) => {
  const ctx = props.context;
  const cfg = ctx.config || {};
  const baseUrl = everkm.base_url(ctx.request_id);
  const lang = ctx.lang || "";
  const siteName = cfg.site?.name || "";
  const postTitle = ctx.post?.title || "";
  const pageTitle = (postTitle ? `${postTitle} | ` : "") + siteName;
  const metaDesc = ctx.post?.meta?.description || "";
  const metaKeywords = ctx.post?.meta?.keywords || "";
  const themeColor = cfg.theme_color || void 0;
  const customCss = cfg.custom_css || void 0;
  const features = cfg.features || {};
  const hasCodeHighlight = features.code_highlight ?? true;
  const hasKatex = features.katex_formula ?? false;
  const ajaxHeadFingerprint = buildAjaxHeadFingerprint(cfg);
  return ssr(_tmpl$42, ssrAttribute("lang", escape(lang, true), false), ssrAttribute("data-ajax-head", escape(ajaxHeadFingerprint, true), false), createComponent(NoHydration, {
    get children() {
      return ssr(_tmpl$33, escape(pageTitle), ssrAttribute("content", escape(metaDesc, true), false), ssrAttribute("content", escape(metaKeywords, true), false), `everkm-publish@v${escape(ctx.everkm_publish_version, true)}`, `${escape(ctx.theme_name, true)}@${escape(ctx.theme_version, true)}`, escape(createComponent(Show, {
        when: !!customCss,
        get children() {
          return ssr(_tmpl$4, ssrAttribute("href", escape(everkm.asset_base_url(ctx.request_id, {
            url: customCss
          }), true), false));
        }
      })), escape(createComponent(Show, {
        when: !!themeColor,
        get children() {
          return ssr(_tmpl$23, ssrAttribute("content", escape(themeColor, true), false));
        }
      })), `
          window.__everkm_lang = ${JSON.stringify(lang)}; 
          window.__everkm_base_url = ${JSON.stringify(baseUrl + "/")};
          window.__everkm_features_code_highlight = ${JSON.stringify(hasCodeHighlight)};
          window.__everkm_features_katex_formula = ${JSON.stringify(hasKatex)};
          `, escape(createComponent(Show, {
        when: hasCodeHighlight,
        get children() {
          return createComponent(Prism, {});
        }
      })), escape(createComponent(Show, {
        when: hasKatex,
        get children() {
          return createComponent(Katex, {});
        }
      })));
    }
  }), escape(props.children));
};

// src/layout/icons.tsx
var _tmpl$5 = ["<svg", ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>'];
var _tmpl$24 = ["<svg", ' viewBox="0 0 16 16" fill="currentColor"><path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"></path></svg>'];
var _tmpl$34 = ["<svg", ' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>'];
var _tmpl$43 = ["<svg", ' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'];
var _tmpl$52 = ["<svg", ' viewBox="0 0 24 24" width="1.5em" height="1.5em"><path fill="currentColor" d="M13.2929 19.7071C12.9024 19.3166 12.9024 18.6834 13.2929 18.2929L18.5858 13L3 13C2.44772 13 2 12.5523 2 12C2 11.4477 2.44771 11 3 11L18.5858 11L13.2929 5.70711C12.9024 5.31658 12.9024 4.68342 13.2929 4.29289C13.6834 3.90237 14.3166 3.90237 14.7071 4.29289L21.7071 11.2929C22.0976 11.6834 22.0976 12.3166 21.7071 12.7071L14.7071 19.7071C14.3166 20.0976 13.6834 20.0976 13.2929 19.7071Z"></path></svg>'];
var _tmpl$6 = ["<svg", ' viewBox="0 0 24 24" width="1.5em" height="1.5em"><path fill="currentColor" d="M10.7071 4.29289C11.0976 4.68342 11.0976 5.31658 10.7071 5.70711L5.41421 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H5.41421L10.7071 18.2929C11.0976 18.6834 11.0976 19.3166 10.7071 19.7071C10.3166 20.0976 9.68342 20.0976 9.29289 19.7071L2.29289 12.7071C1.90237 12.3166 1.90237 11.6834 2.29289 11.2929L9.29289 4.29289C9.68342 3.90237 10.3166 3.90237 10.7071 4.29289Z"></path></svg>'];
var _tmpl$7 = ['<svg xmlns="http://www.w3.org/2000/svg"', ' viewBox="0 0 16 16"><path fill="currentColor" d="M12 13q-.68 0-1.21-.236a1.95 1.95 0 0 1-.841-.707q-.305-.472-.305-1.17q0-.591.217-.993a1.8 1.8 0 0 1 .591-.647q.374-.245.85-.369q.48-.125 1.01-.175q.618-.064.998-.12q.379-.06.55-.175c.171-.115.171-.191.171-.342v-.028q0-.438-.277-.679q-.273-.24-.776-.24q-.531 0-.845.236a1.2 1.2 0 0 0-.231.221c-.147.187-.355.348-.592.328l-.845-.068c-.301-.025-.516-.312-.392-.587a2.4 2.4 0 0 1 .369-.577q.406-.475 1.05-.73q.646-.259 1.5-.26a4.5 4.5 0 0 1 1.13.14q.545.139.965.429q.424.29.67.748q.245.451.245 1.09v4.28a.5.5 0 0 1-.5.5h-.866a.5.5 0 0 1-.5-.5v-.484h-.055a2 2 0 0 1-.457.586q-.286.249-.688.393a2.9 2.9 0 0 1-.928.138zm.563-1.36q.434 0 .767-.171q.333-.176.522-.471c.189-.295.189-.42.189-.67v-.753q-.092.06-.254.111q-.157.046-.356.088a18 18 0 0 1-.397.07l-.36.05a2.4 2.4 0 0 0-.605.162a1 1 0 0 0-.402.3a.73.73 0 0 0-.143.462q0 .402.291.614q.295.208.748.208"></path><path fill="currentColor" fill-rule="evenodd" d="M5.47 1.34a.501.501 0 0 0-.949.009l-3.28 10.3a.5.5 0 0 1-.476.348H.496a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 0-1h-.474a.25.25 0 0 1-.238-.326l.422-1.33a.5.5 0 0 1 .476-.348h2.86a.5.5 0 0 1 .476.346l.43 1.33a.25.25 0 0 1-.238.327h-.219a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-.034a.5.5 0 0 1-.473-.339l-3.52-10.3zM5.846 9a.175.175 0 0 0 .166-.229l-1.25-3.85a.175.175 0 0 0-.333 0l-1.22 3.85A.175.175 0 0 0 3.376 9z" clip-rule="evenodd"></path></svg>'];
var _tmpl$8 = ["<svg", ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>'];
var HomeIcon = (props) => ssr(_tmpl$5, ssrAttribute("class", escape(props.class, true) || "w-4 h-4", false));
var ChevronRightIcon = (props) => ssr(_tmpl$24, ssrAttribute("class", escape(props.class, true) || "w-3 h-3 mx-1 inline-flex items-center", false));
var MenuIcon = (props) => ssr(_tmpl$34, ssrAttribute("class", escape(props.class, true) || "w-5 h-5", false));
var CloseIcon = (props) => ssr(_tmpl$43, ssrAttribute("class", escape(props.class, true) || "w-5 h-5", false));
var NextArrowIcon = (props) => ssr(_tmpl$52, ssrAttribute("class", escape(props.class, true) || "inline-block", false));
var PrevArrowIcon = (props) => ssr(_tmpl$6, ssrAttribute("class", escape(props.class, true) || "inline-block", false));
var SettingsIcon = (props) => ssr(_tmpl$7, ssrAttribute("class", escape(props.class, true) || "w-5 h-5", false));
var LightningIcon = (props) => ssr(_tmpl$8, ssrAttribute("class", escape(props.class, true) || "w-4 h-4 inline-block", false));

// src/layout/Sidebar.tsx
var _tmpl$9 = ["<img", ' class="h-7 w-auto">'];
var _tmpl$25 = ['<span class="text-lg font-medium">', "</span>"];
var _tmpl$35 = ['<div class="flex h-14 items-center justify-between px-2 md:px-4 bg-gray-50 dark:bg-gray-900 z-10"><a data-logo href="', '" class="flex items-center gap-2">', '</a><button data-drawer-close="sidebar-nav" class="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">', "</button></div>"];
var _tmpl$44 = ['<aside id="sidebar-nav" class="', '">', '<nav id="sidebar-nav-tree" class="', '">', "</nav></aside>"];
var Sidebar = (props) => {
  const belowHeader = () => props.belowHeader === true;
  return ssr(_tmpl$44, `${belowHeader() ? "fixed lg:relative h-dvh lg:h-full" : ""} ${!belowHeader() ? "fixed h-dvh lg:sticky" : ""}  w-[80%] lg:w-[var(--sidebar-width)] bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 top-0 z-50 transform transition-transform duration-300 lg:translate-x-0 -translate-x-full flex flex-col print:hidden`, escape(createComponent(Show, {
    get when() {
      return !belowHeader() && !props.configValue("layout.aisde_no_header", false);
    },
    get children() {
      return ssr(_tmpl$35, `${escape(props.baseUrl, true)}/`, escape(createComponent(Show, {
        get when() {
          return props.configValue("site.logo");
        },
        get fallback() {
          return ssr(_tmpl$25, escape(props.configValue("site.name")));
        },
        get children() {
          return [ssr(_tmpl$9, ssrAttribute("src", escape(everkm.asset_base_url(props.requestId, {
            url: String(props.configValue("site.logo"))
          }), true), false) + ssrAttribute("alt", escape(String(props.configValue("site.name")), true), false)), createComponent(Show, {
            get when() {
              return !props.configValue("layout.only_display_logo");
            },
            get children() {
              return ssr(_tmpl$25, escape(props.configValue("site.name")));
            }
          })];
        }
      })), escape(createComponent(CloseIcon, {
        "class": "w-5 h-5"
      })));
    }
  })), `flex-1 px-4 !bg-transparent nav-tree invisible overflow-y-auto my-scrollbar ${!belowHeader() ? "!py-0" : ""} ${belowHeader() ? "!pt-4 !pb-0" : ""}`, props.navDoc?.content_html || "");
};
var Sidebar_default = Sidebar;

// src/youlog_lib/widgets/nav-menu/ssr.tsx
var _tmpl$10 = ["<ul>", "</ul>"];
var _tmpl$26 = ["<li><a", ">", "</a>", "</li>"];
var _tmpl$36 = ['<div data-role="nav-menu">', "</div>"];
var NavMenuInner = (props) => ssr(_tmpl$10, escape(createComponent(For, {
  get each() {
    return props.items;
  },
  children: (item) => ssr(_tmpl$26, ssrAttribute("href", escape(item.url, true) || "#", false) + ssrAttribute("target", (item.new_window ?? props.defaultNewWindow) !== false ? "_blank" : escape(void 0, true), false) + ssrAttribute("data-nav-menu-context", props.withContext ? escape(JSON.stringify({
    ...item,
    children: void 0
  }), true) : escape(void 0, true), false), escape(item.title), escape(createComponent(Show, {
    get when() {
      return item.children;
    },
    get children() {
      return createComponent(NavMenuInner, {
        get items() {
          return item.children;
        },
        get requestId() {
          return props.requestId;
        },
        get defaultNewWindow() {
          return props.defaultNewWindow;
        },
        get withContext() {
          return props.withContext;
        }
      });
    }
  })))
})));
var NavMenu = (props) => ssr(_tmpl$36, escape(createComponent(NavMenuInner, props)));
var ssr_default = NavMenu;

// src/layout/TopHeader.tsx
var _tmpl$11 = ['<button data-drawer-toggle="sidebar-nav" class="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">', "</button>"];
var _tmpl$27 = ["<img", ' class="h-7 w-auto">'];
var _tmpl$37 = ['<span class="text-lg font-semibold text-gray-900 dark:text-white truncate">', "</span>"];
var _tmpl$45 = ['<a data-logo href="', '" class="flex items-center gap-2 min-w-0">', "</a>"];
var _tmpl$53 = ['<div class="flex-1 min-w-0"><h1 data-app-name class="text-lg font-semibold text-gray-900 dark:text-white truncate hidden-repeat-site-name">', '</h1><h1 data-article-title-bar data-ajax-element="article-title-bar" class="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hidden">', "</h1></div>"];
var _tmpl$62 = ["<x-in-search", ' only-button="false"></x-in-search>'];
var _tmpl$72 = '<div id="mobile-menu-container" class="md:hidden"></div>';
var _tmpl$82 = ['<nav class="hidden md:block invisible" id="header-nav">', "</nav>"];
var _tmpl$92 = ['<header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 print:hidden"><div class="flex h-14 items-center justify-between px-2 md:px-4"><div class="flex items-center gap-2 flex-1 min-w-0">', "", "", '</div><div class="flex items-center space-x-4 flex-shrink-0">', "", "", '<button data-el="open-theme-setting" class="p-1.5 text-text-secondary dark:text-text-secondary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">', "</button></div></div></header>"];
var TopHeader = (props) => {
  const showNavToggle = () => props.showNavToggle !== false;
  const stack = () => props.stack === true;
  const showSiteBranding = () => !props.configValue("layout.aisde_no_header", false);
  return ssr(_tmpl$92, escape(createComponent(Show, {
    get when() {
      return showNavToggle();
    },
    get children() {
      return ssr(_tmpl$11, escape(createComponent(MenuIcon, {
        "class": "w-5 h-5"
      })));
    }
  })), escape(createComponent(Show, {
    get when() {
      return stack();
    },
    get children() {
      return createComponent(Show, {
        get when() {
          return showSiteBranding();
        },
        get children() {
          return ssr(_tmpl$45, `${escape(props.baseUrl, true)}/`, escape(createComponent(Show, {
            get when() {
              return props.configValue("site.logo");
            },
            get fallback() {
              return ssr(_tmpl$37, escape(props.configValue("site.name")));
            },
            get children() {
              return [ssr(_tmpl$27, ssrAttribute("src", escape(everkm.asset_base_url(props.requestId, {
                url: String(props.configValue("site.logo"))
              }), true), false) + ssrAttribute("alt", escape(String(props.configValue("site.name")), true), false)), createComponent(Show, {
                get when() {
                  return !props.configValue("layout.only_display_logo");
                },
                get children() {
                  return ssr(_tmpl$37, escape(props.configValue("site.name")));
                }
              })];
            }
          })));
        }
      });
    }
  })), escape(createComponent(Show, {
    get when() {
      return !stack();
    },
    get children() {
      return ssr(_tmpl$53, escape(props.configValue("site.name")), escape(props.doc?.title) || "UNTITLED");
    }
  })), escape(createComponent(Show, {
    get when() {
      return props.configValue("algolia_search");
    },
    get children() {
      return ssr(_tmpl$62, ssrAttribute("app-id", escape(props.configValue("algolia_search.app_id"), true), false) + ssrAttribute("api-key", escape(props.configValue("algolia_search.api_key"), true), false) + ssrAttribute("index", escape(props.configValue("algolia_search.index_name"), true), false) + ssrAttribute("site", escape(props.configValue("algolia_search.site"), true), false));
    }
  })), escape(createComponent(Show, {
    get when() {
      return props.configValue("header_nav");
    },
    get children() {
      return ssr(_tmpl$72);
    }
  })), escape(createComponent(Show, {
    get when() {
      return props.configValue("header_nav");
    },
    get children() {
      return ssr(_tmpl$82, escape(createComponent(ssr_default, {
        get items() {
          return props.configValue("header_nav", []);
        },
        get requestId() {
          return props.requestId;
        }
      })));
    }
  })), escape(createComponent(SettingsIcon, {
    "class": "w-5 h-5"
  })));
};
var TopHeader_default = TopHeader;

// src/layout/Breadcrumb.tsx
var _tmpl$12 = ['<div id="breadcrumb" data-ajax-element="breadcrumb" class="text-text-tertiary dark:text-text-tertiary text-[0.95em] mx-auto flex items-center flex-wrap relative -top-5 print:hidden">', "</div>"];
var _tmpl$28 = ['<a class="text-text-primary dark:text-text-primary hover:text-brand-primary dark:hover:text-brand-primary-light transition-colors inline-flex items-center"', ">", "</a>"];
var _tmpl$38 = ["<span data-nav-title>", "</span>"];
var Breadcrumb = (props) => {
  return ssr(_tmpl$12, escape(createComponent(Show, {
    get when() {
      return props.navs.length > 1;
    },
    get children() {
      return createComponent(For, {
        get each() {
          return props.navs;
        },
        children: (nav) => [createComponent(Show, {
          get when() {
            return !nav.is_first;
          },
          get children() {
            return createComponent(ChevronRightIcon, {});
          }
        }), !nav.is_last ? ssr(_tmpl$28, ssrAttribute("href", escape(nav.url, true) || "javascript:void(0)", false), nav.is_first ? escape(createComponent(HomeIcon, {
          "class": "w-[1.2em] h-[1.2em]"
        })) : ssr(_tmpl$38, escape(nav.title))) : nav.is_first ? createComponent(HomeIcon, {
          "class": "w-[1.2em] h-[1.2em]"
        }) : ssr(_tmpl$38, escape(nav.title))]
      });
    }
  })));
};
var Breadcrumb_default = Breadcrumb;

// src/layout/PrevNextLinks.tsx
var _tmpl$13 = ['<div class="gap-2 flex items-center"><span class="text-text-secondary dark:text-text-secondary">\u4E0A\u4E00\u7BC7:</span><a class="hover:text-[--link-hover]"', ">", "</a></div>"];
var _tmpl$29 = ['<div class="gap-2 flex items-center"><span class="text-text-secondary dark:text-text-secondary">\u4E0B\u4E00\u7BC7:</span><a class="hover:text-[--link-hover]"', ">", "</a></div>"];
var _tmpl$39 = ['<div class="mt-10 pt-8 border-t border-border dark:border-border space-y-2 print:hidden">', "", "</div>"];
var PrevNextLinks = (props) => {
  const prevPost = (() => {
    const id = props.qs?.prev;
    if (!id) return void 0;
    try {
      return everkm.post_detail(props.requestId, {
        id: String(id)
      });
    } catch (e) {
      return void 0;
    }
  })();
  const nextPost = (() => {
    const id = props.qs?.next;
    if (!id) return void 0;
    try {
      return everkm.post_detail(props.requestId, {
        id: String(id)
      });
    } catch (e) {
      return void 0;
    }
  })();
  return createComponent(Show, {
    when: prevPost || nextPost,
    get children() {
      return ssr(_tmpl$39, escape(createComponent(Show, {
        when: prevPost,
        get children() {
          return ssr(_tmpl$13, ssrAttribute("href", escape(prevPost?.url_path, true) || escape(prevPost?.path, true), false), escape(prevPost?.title));
        }
      })), escape(createComponent(Show, {
        when: nextPost,
        get children() {
          return ssr(_tmpl$29, ssrAttribute("href", escape(nextPost?.url_path, true) || escape(nextPost?.path, true), false), escape(nextPost?.title));
        }
      })));
    }
  });
};
var PrevNextLinks_default = PrevNextLinks;

// src/layout/PageNavigation.tsx
var _tmpl$14 = ['<a class="flex-1 block"', '><div class="border border-border dark:border-border rounded p-4 flex flex-col items-end hover:border-brand-primary dark:hover:border-brand-primary-light transition-colors"><div class="flex text-text-tertiary dark:text-text-tertiary mb-2 items-center flex-row-reverse">', '</div><span class="text-lg font-medium text-text-primary dark:text-text-primary">', "</span></div></a>"];
var _tmpl$210 = ['<a class="flex-1 block"', '><div class="border border-border dark:border-border rounded p-4 flex flex-col items-start hover:border-brand-primary dark:hover:border-brand-primary-light transition-colors"><div class="flex text-text-tertiary dark:text-text-tertiary mb-2 items-center">', '</div><span class="text-lg font-medium text-text-primary dark:text-text-primary">', "</span></div></a>"];
var _tmpl$310 = ['<div class="mt-10 pt-8 border-t border-border dark:border-border space-y-4 md:flex md:flex-row-reverse md:items-center md:space-y-0 md:gap-8">', "", "</div>"];
var _tmpl$46 = ['<div id="page-indicator" data-ajax-element="page-indicator" class="print:hidden">', "</div>"];
var PageNavigation = (props) => {
  return ssr(_tmpl$46, escape(createComponent(Show, {
    get when() {
      return props.pageNav.next || props.pageNav.prev;
    },
    get children() {
      return ssr(_tmpl$310, escape(createComponent(Show, {
        get when() {
          return props.pageNav.next;
        },
        get children() {
          return ssr(_tmpl$14, ssrAttribute("href", escape(props.pageNav.next?.link, true), false), escape(createComponent(NextArrowIcon, {
            "class": "inline-block"
          })), escape(props.pageNav.next?.title));
        }
      })), escape(createComponent(Show, {
        get when() {
          return props.pageNav.prev;
        },
        get children() {
          return ssr(_tmpl$210, ssrAttribute("href", escape(props.pageNav.prev?.link, true), false), escape(createComponent(PrevArrowIcon, {
            "class": "inline-block"
          })), escape(props.pageNav.prev?.title));
        }
      })));
    }
  })));
};
var PageNavigation_default = PageNavigation;

// src/layout/YoushaComment.tsx
var _tmpl$15 = ['<div class="mt-10 pt-8 print:hidden"><yousha-comment', "></yousha-comment></div>"];
var _tmpl$211 = '<script src="https://share.yousha.top/embed/yousha-comment.js" type="module"></script>';
var YoushaComment = (props) => {
  return createComponent(Show, {
    get when() {
      return props.configValue("yousha");
    },
    get children() {
      return ssr(_tmpl$15, ssrAttribute("community", escape(props.configValue("yousha.community"), true), false));
    }
  });
};
var YoushaCommentScript = (props) => {
  return createComponent(Show, {
    get when() {
      return props.configValue("yousha");
    },
    get children() {
      return ssr(_tmpl$211);
    }
  });
};
var YoushaComment_default = YoushaComment;

// src/layout/Footer.tsx
var _tmpl$16 = ['<div class="flex items-center flex-wrap justify-center gap-2 text-sm text-text-secondary dark:text-text-secondary">', "</div>"];
var _tmpl$212 = ["<a", ' class="hover:text-text-secondary hover:underline dark:hover:text-text-secondary transition-colors">', "</a>"];
var _tmpl$311 = '<span class="text-text-quaternary dark:text-text-quaternary">|</span>';
var _tmpl$47 = ["<span><a", ' target="_blank" class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors">Youlog</a><span class="mx-2 text-text-quaternary dark:text-text-quaternary">|</span></span>'];
var _tmpl$54 = ['<span><youlog-version class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors cursor-pointer"', "></youlog-version></span>"];
var _tmpl$63 = ['<div class="text-text-tertiary dark:text-text-tertiary text-sm text-center flex flex-wrap justify-center items-center">', "", "</div>"];
var _tmpl$73 = ["<a", ' target="_blank" class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors">', "</a>"];
var _tmpl$83 = ["<span>", " ", "</span>"];
var _tmpl$93 = ["<span>", "</span>"];
var _tmpl$102 = ['<div class="text-text-tertiary dark:text-text-tertiary text-sm text-center flex flex-wrap justify-center items-center gap-4">', "", '<span class="flex items-center">', '<a href="https://youlog.theme.everkm.com" target="_blank" title="', '" class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors">Youlog</a></span></div>'];
var _tmpl$112 = '<span class="mx-2 text-text-quaternary dark:text-text-quaternary">|</span>';
var _tmpl$122 = ['<div class="mt-10 pt-8 flex flex-col items-center justify-center gap-2 print:hidden">', "", "", "</div>"];
var BottomNav = (props) => {
  return ssr(_tmpl$16, escape(createComponent(For, {
    get each() {
      return props.configValue("bottom_nav", []);
    },
    children: (item, index) => [ssr(_tmpl$212, ssrAttribute("href", escape(item.url, true), false) + ssrAttribute("target", item.new_window !== false ? "_blank" : escape(void 0, true), false), escape(item.title)), index() < props.configValue("bottom_nav", []).length - 1 && ssr(_tmpl$311)]
  })));
};
var YoulogPlatform = (props) => {
  return ssr(_tmpl$63, escape(createComponent(Show, {
    get when() {
      return props.youlogPlatform;
    },
    get children() {
      return ssr(_tmpl$47, ssrAttribute("href", escape(props.youlogPlatform, true), false));
    }
  })), escape(createComponent(Show, {
    get when() {
      return props.youlogVersion;
    },
    get children() {
      return ssr(_tmpl$54, ssrAttribute("version-list-url", escape(props.versionsUrl, true) || "", false) + ssrAttribute("version", escape(props.youlogVersion, true) || "", false));
    }
  })));
};
var CopyrightAndBeian = (props) => {
  return ssr(_tmpl$102, escape(createComponent(Show, {
    get when() {
      return props.configValue("copyright");
    },
    get children() {
      return ssr(_tmpl$83, props.configValue("copyright.from_year") ? `\xA9${escape(props.configValue("copyright.from_year"))}-${escape((/* @__PURE__ */ new Date()).getFullYear())}` : `\xA9${escape((/* @__PURE__ */ new Date()).getFullYear())}`, escape(createComponent(Show, {
        get when() {
          return props.configValue("copyright.text");
        },
        get children() {
          return createComponent(Show, {
            get when() {
              return props.configValue("copyright.link");
            },
            get fallback() {
              return props.configValue("copyright.text");
            },
            get children() {
              return ssr(_tmpl$73, ssrAttribute("href", escape(props.configValue("copyright.link"), true), false), escape(props.configValue("copyright.text")));
            }
          });
        }
      })));
    }
  })), escape(createComponent(Show, {
    get when() {
      return props.configValue("beian") && props.configValue("beian").length > 0;
    },
    get children() {
      return ssr(_tmpl$93, escape(createComponent(For, {
        get each() {
          return props.configValue("beian", []);
        },
        children: (beian, index) => [ssr(_tmpl$73, ssrAttribute("href", escape(beian.link, true), false), escape(beian.text)), index() < props.configValue("beian", []).length - 1 && ssr(_tmpl$112)]
      })));
    }
  })), escape(createComponent(LightningIcon, {
    "class": "w-4 h-4 inline-block"
  })), `Powered by everkm-publish@v${escape(props.pageContext.everkm_publish_version, true)} with theme youlog@v${escape(props.pageContext.theme_version, true)}`);
};
var Footer = (props) => {
  return ssr(_tmpl$122, escape(createComponent(BottomNav, {
    get configValue() {
      return props.configValue;
    }
  })), escape(createComponent(YoulogPlatform, {
    get youlogPlatform() {
      return props.youlogPlatform;
    },
    get youlogVersion() {
      return props.youlogVersion;
    },
    get versionsUrl() {
      return props.versionsUrl;
    }
  })), escape(createComponent(CopyrightAndBeian, {
    get pageContext() {
      return props.pageContext;
    },
    get configValue() {
      return props.configValue;
    }
  })));
};
var Footer_default = Footer;

// src/layout/PageQrcode.tsx
var _tmpl$17 = '<div class="md:flex flex-col items-center my-6 hidden print:flex"><div data-el="page-qrcode" class="flex justify-center bg-white"></div><p class="text-sm text-gray-600 dark:text-gray-400 text-center whitespace-nowrap w-full">\u626B\u7801\u6253\u5F00\u672C\u9875\u9762</p></div>';
var PageQrcode = () => {
  return ssr(_tmpl$17);
};
var PageQrcode_default = PageQrcode;

// src/layout/PrintPage.tsx
var _tmpl$18 = ['<a href="javascript:youlog.print()" class="', '"><span class="icon-[prime--print] text-base"></span>Print</a>'];
var PrintPage = (props) => {
  return ssr(_tmpl$18, `${escape(props.className, true)}`);
};
var PrintPage_default = PrintPage;

// src/layout/ArticleContent.tsx
var _tmpl$19 = ['<div class="flex items-center"', '><span class="icon-[uil--map-pin-alt] text-base"></span><a href="', '" target="_blank" data-no-ajax>https://', "/", "</a></div>"];
var _tmpl$213 = ['<div class="text-sm flex items-center gap-4 text-gray-500 dark:text-gray-400"><div class="flex items-center gap-0.5"', '><span class="icon-[lets-icons--date-range-light] text-base"></span>', "</div>", "", "</div>"];
var _tmpl$312 = ['<div id="doc-meta" data-ajax-element="doc-meta">', '<div class="h-6 w-full print:hidden"></div></div>'];
var _tmpl$48 = ['<div class="hidden print:flex print:items-center print:justify-between print:gap-2 text-gray-400 dark:text-gray-500 print:text-sm"><div>', '</div><div class="font-sans" data-el="page-url"></div></div>'];
var _tmpl$55 = ['<div class="w-full lg:w-3/4 pr-0 lg:pl-4 lg:pr-8 print:w-full print:p-0 leading-relaxed relative print:static">', '<div id="page-main">', '<h1 id="article-title" data-ajax-element="article-title" class="text-[1.8em] font-bold text-gray-900 dark:text-white text-center mb-4 !mt-0">', "</h1>", '<article id="article-main" data-ajax-element="article-main" class="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none !pt-0"><div class="markdown-body">', "</div>", "</article>", "</div>", "", "", "</div>"];
var DocMeta = (props) => {
  return ssr(_tmpl$312, escape(createComponent(Show, {
    get when() {
      return !props.doc?.meta?.hide_meta;
    },
    get children() {
      return ssr(_tmpl$213, ssrAttribute("data-doc-update-at", escape(props.doc?.updated_at?.toString(), true), false), escape(formatDate(props.doc?.updated_at)), escape(createComponent(Show, {
        get when() {
          return props.doc?.meta?.permalink;
        },
        get children() {
          return ssr(_tmpl$19, ssrAttribute("data-doc-meta-permalink", escape(props.doc?.meta?.permalink, true), false), `/${escape(props.doc?.meta?.permalink, true)}?__not_follow`, escape(props.configValue("site.host")), escape(props.doc?.meta?.permalink));
        }
      })), escape(createComponent(Show, {
        get when() {
          return props.showPrint;
        },
        get children() {
          return createComponent(PrintPage_default, {
            className: "hidden md:flex items-center print:hidden"
          });
        }
      })));
    }
  })));
};
var ArticleContent = (props) => {
  let htmlContent = props.doc?.content_html || "";
  htmlContent = htmlContent.replaceAll(' class="math math-', ' class="opacity-0 math math-');
  const showPrint = () => getDisplayFlag(props.pageContext.config, props.doc?.meta, "print", true);
  const showPageQrcode = () => getDisplayFlag(props.pageContext.config, props.doc?.meta, "page_qrcode", true);
  return ssr(_tmpl$55, escape(createComponent(Breadcrumb_default, {
    get navs() {
      return props.pageContext.breadcrumbs || [];
    }
  })), escape(createComponent(Show, {
    get when() {
      return showPrint();
    },
    get children() {
      return ssr(_tmpl$48, escape(props.configValue("site.name")));
    }
  })), escape(props.doc?.title) || "\u65E0\u6807\u9898", escape(createComponent(DocMeta, {
    get doc() {
      return props.doc;
    },
    get configValue() {
      return props.configValue;
    },
    get showPrint() {
      return showPrint();
    }
  })), htmlContent, escape(createComponent(PrevNextLinks_default, {
    get requestId() {
      return props.requestId;
    },
    get qs() {
      return props.pageContext.qs || {};
    }
  })), escape(createComponent(Show, {
    get when() {
      return showPageQrcode();
    },
    get children() {
      return createComponent(PageQrcode_default, {});
    }
  })), escape(createComponent(PageNavigation_default, {
    get pageNav() {
      return props.pageNav;
    }
  })), escape(createComponent(YoushaComment_default, {
    get configValue() {
      return props.configValue;
    }
  })), escape(createComponent(Footer_default, {
    get requestId() {
      return props.requestId;
    },
    get pageContext() {
      return props.pageContext;
    },
    get configValue() {
      return props.configValue;
    },
    get youlogPlatform() {
      return props.youlogPlatform;
    },
    get youlogVersion() {
      return props.youlogVersion;
    },
    get versionsUrl() {
      return props.versionsUrl;
    }
  })));
};
var ArticleContent_default = ArticleContent;

// src/layout/TOC.tsx
var _tmpl$20 = '<div class="w-full lg:w-1/4 mt-8 lg:mt-0 print:hidden"><div id="toc" class="mb-6 text-[0.9em] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1 overflow-y-auto"></div></div>';
var TOC = () => {
  return ssr(_tmpl$20);
};
var TOC_default = TOC;

// src/pages/book.tsx
var _tmpl$21 = ['<div class="flex-1"><div class="container mx-auto px-4 py-8 print:p-0"><div class="flex flex-col lg:flex-row">', "", "</div></div></div>"];
var _tmpl$214 = ['<div id="page-shell"', ">", "", "</div>"];
var _tmpl$313 = ['<div class="flex flex-1 min-h-0">', '<div id="body-main" class="flex-1 flex flex-col overflow-auto print:overflow-visible min-h-0">', "</div></div>"];
var _tmpl$49 = ['<div id="body-main" class="flex-1 flex flex-col overflow-auto print:overflow-visible min-h-0">', "", "</div>"];
function isTruthyQuery(value) {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }
  return false;
}
var BookPage = (props) => {
  const pageContext = props.props;
  const requestId = pageContext.request_id;
  const doc = (() => {
    const post = pageContext.post;
    if (!post) throw new Error("Post not found");
    const doc2 = everkm.post_detail(requestId, {
      path: post.path
    });
    if (!doc2) throw new Error("Post not found");
    return doc2;
  })();
  const navFile = pageContext.qs?.nav_file;
  const stackLayout = isTruthyQuery(pageContext.qs?.stack);
  const navDoc = (() => {
    if (!navFile) return null;
    try {
      const doc2 = everkm.post_detail(requestId, {
        path: navFile,
        allow_missing: true
      });
      if (!doc2) return null;
      return doc2;
    } catch {
      return null;
    }
  })();
  const pageNav = navFile ? everkm.nav_indicator(requestId, {
    from_file: navFile
  }) : {};
  const config = pageContext.config;
  const configValue = (path, defaultValue = void 0) => {
    return getConfigValue(config, path, defaultValue);
  };
  const baseUrl = everkm.base_url(requestId);
  const youlogPlatform = everkm.env(requestId, {
    name: "YOULOG_PLATFORM",
    default: ""
  });
  const versionsUrl = everkm.env(requestId, {
    name: "YOULOG_VERSIONS_URL",
    default: ""
  });
  const youlogVersion = everkm.env(requestId, {
    name: "YOULOG_VERSION",
    default: ""
  });
  const mainContent = ssr(_tmpl$21, escape(createComponent(ArticleContent_default, {
    requestId,
    doc,
    pageContext,
    pageNav,
    configValue,
    youlogPlatform,
    youlogVersion,
    versionsUrl
  })), escape(createComponent(TOC_default, {})));
  const sidebar = createComponent(Show, {
    when: navDoc,
    children: (nav) => createComponent(Sidebar_default, {
      requestId,
      baseUrl,
      get navDoc() {
        return nav();
      },
      configValue,
      belowHeader: stackLayout
    })
  });
  const topHeader = createComponent(TopHeader_default, {
    requestId,
    doc,
    configValue,
    showNavToggle: !!navDoc,
    stack: stackLayout,
    baseUrl
  });
  const ajaxPageFingerprint = buildAjaxPageFingerprint({
    page: "book",
    stack: stackLayout,
    hasNav: !!navDoc,
    config,
    docMeta: doc?.meta
  });
  return ssr(_tmpl$214, ssrAttribute("data-ajax-layout", escape(ajaxPageFingerprint, true), false) + ssrAttribute("class", stackLayout ? "flex flex-col h-dvh" : "flex h-dvh", false), stackLayout ? escape([topHeader, ssr(_tmpl$313, escape(sidebar), escape(mainContent))]) : escape([sidebar, ssr(_tmpl$49, escape(topHeader), escape(mainContent))]), escape(createComponent(YoushaCommentScript, {
    configValue
  })));
};

// src/pages/index.tsx
async function renderPage(compName, props) {
  const html = await renderToStringAsync(() => {
    switch (compName) {
      case "book":
        return createComponent(RootLayout, {
          context: props,
          get children() {
            return createComponent(BookPage, {
              props
            });
          }
        });
      default:
        throw new Error(`Page ${compName} not found`);
    }
  });
  const cssYoulog = everkm.assets(props.request_id, {
    type: "css",
    section: "youlog"
  }) || "";
  const cssSearch = everkm.assets(props.request_id, {
    type: "css",
    section: "plugin-in-search"
  }) || "";
  const jsYoulog = everkm.assets(props.request_id, {
    type: "js",
    section: "youlog"
  }) || "";
  const jsSearch = everkm.assets(props.request_id, {
    type: "js",
    section: "plugin-in-search"
  }) || "";
  const alpine = `<script src="${everkm.asset_base_url(props.request_id)}/assets/alpinejs@3.14.9.js" defer></script>`;
  const withCss = html.replace(/<\/script>/i, `</script>${cssYoulog}${cssSearch}${alpine}`);
  const withJs = withCss.replace(/<\/body>/i, `${jsYoulog}${jsSearch}</body>`);
  return `<!DOCTYPE html>${withJs}`;
}

// src/youlog_lib/dcard/icons.tsx
var _tmpl$30 = ['<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"', '><path fill="currentColor" d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0"></path></svg>'];
var _tmpl$215 = ['<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"', '><path fill="currentColor" d="M685.248 104.704a64 64 0 0 1 0 90.496L368.448 512l316.8 316.8a64 64 0 0 1-90.496 90.496L232.704 557.248a64 64 0 0 1 0-90.496l362.048-362.048a64 64 0 0 1 90.496 0"></path></svg>'];
var NavigateNextIcon = (props) => ssr(_tmpl$30, ssrAttribute("class", escape(props.class, true), false));
var NavigatePrevIcon = (props) => ssr(_tmpl$215, ssrAttribute("class", escape(props.class, true), false));

// src/youlog_lib/dcard/utils.ts
var import_dayjs2 = __toESM(require_dayjs_min(), 1);
function formatDate2(timestamp, format = "YYYY-MM-DD") {
  if (!timestamp) return "";
  return import_dayjs2.default.unix(timestamp).format(format);
}

// src/youlog_lib/dcard/DcardList.tsx
var _tmpl$31 = ["<ol>", "</ol>"];
var _tmpl$216 = ["<a", ' class="flex items-center gap-0.5 p-1.5 rounded-md hover:bg-brand-primary-subtle dark:hover:bg-brand-primary-subtle-light transition-colors">', "</a>"];
var _tmpl$314 = ['<div class="space-x-6 flex !mt-10 text-normal items-center justify-center"><div class="flex items-center space-x-1">', '</div><div x-data="', '" x-init="', '"><select x-model="currentPage" x-on:change="goToPage()" class="text-gray-600 text-sm rounded pl-1 py-1 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">', '</select></div><div class="flex items-center space-x-1">', "</div></div>"];
var _tmpl$410 = '<span class="!text-red-500 mark-top"></span>';
var _tmpl$56 = ["<li><a", ' target="_blank">', "</a>", '<div class="text-gray-500 dark:text-gray-400 font-light text-[90%] number flex items-center gap-2"><span>', "</span></div></li>"];
var _tmpl$64 = ['<span class="flex items-center gap-0.5 p-1.5 rounded-md opacity-30 cursor-not-allowed" aria-disabled="true">', "</span>"];
var _tmpl$74 = ["<option", "", ">", "</option>"];
var DcardList = (props) => {
  const ctx = props.page_context;
  const requestId = ctx.request_id;
  const qs = ctx.qs || {};
  const pageNo = (() => {
    const n2 = Number(qs.page ?? 1);
    return Number.isFinite(n2) && n2 > 0 ? Math.floor(n2) : 1;
  })();
  const pageSize = props.page_size && props.page_size > 0 ? props.page_size : 6;
  const baseArgs = {
    dir: props.dir,
    recursive: props.recursive ?? true,
    exclude_tags: props.exclude_tags,
    include_myself: props.include_myself
  };
  const currentOffset = (pageNo - 1) * pageSize;
  const {
    items,
    total
  } = everkm.posts(requestId, {
    ...baseArgs,
    offset: currentOffset,
    limit: pageSize
  });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pagePathBase = ctx.page_path_base;
  const pageUrl = (page) => {
    let qs2 = everkm.page_query(requestId, {
      page: ""
    });
    let url = page <= 1 ? `${pagePathBase}.html` : `${pagePathBase}.p${page}.html`;
    if (qs2) url += `?${qs2}`;
    return url;
  };
  const buildItemHref = (doc) => {
    if (props.hide_prev_next) return doc.url_path;
    const params = [];
    if (doc.prev_id) params.push(`prev=${encodeURIComponent(doc.prev_id)}`);
    if (doc.next_id) params.push(`next=${encodeURIComponent(doc.next_id)}`);
    if (params.length === 0) return doc.url_path;
    const sep = doc.url_path.includes("?") ? "&" : "?";
    return `${doc.url_path}${sep}${params.join("&")}`;
  };
  return [ssr(_tmpl$31, escape(createComponent(For, {
    each: items,
    children: (doc) => ssr(_tmpl$56, ssrAttribute("href", escape(buildItemHref(doc), true), false), escape(doc.title), escape(createComponent(Show, {
      get when() {
        return doc.weight > 0;
      },
      get children() {
        return ssr(_tmpl$410);
      }
    })), escape(formatDate2(doc.updated_at, "YYYY-MM-DD HH:mm")))
  }))), createComponent(Show, {
    when: pageCount > 1,
    get children() {
      return ssr(_tmpl$314, escape(createComponent(Show, {
        when: pageNo > 1,
        get fallback() {
          return ssr(_tmpl$64, escape(createComponent(NavigatePrevIcon, {})));
        },
        get children() {
          return ssr(_tmpl$216, ssrAttribute("href", escape(pageUrl(pageNo - 1), true), false), escape(createComponent(NavigatePrevIcon, {})));
        }
      })), `{
              currentPage: ${escape(pageNo, true)},
              totalPages: ${escape(pageCount, true)},
              baseUrl: '${escape(pagePathBase, true)}',
              pageQuery: '${ctx.env_is_preview ? "" : ""}',
              goToPage() {
                const page = parseInt(this.currentPage);
                if (page >= 1 && page <= this.totalPages) {
                  let url = page === 1 ? this.baseUrl + '.html' : this.baseUrl + '.p' + page + '.html';
                  window.dispatchEvent(new CustomEvent('page-navigate', { detail: { url } }));
                }
              }
            }`, `currentPage = ${escape(pageNo, true)}`, escape(createComponent(For, {
        get each() {
          return Array.from({
            length: pageCount
          }, (_3, i2) => i2 + 1);
        },
        children: (p3) => ssr(_tmpl$74, ssrAttribute("value", escape(p3, true), false), ssrAttribute("selected", p3 === pageNo, true), `${escape(p3)} / ${escape(pageCount)}`)
      })), escape(createComponent(Show, {
        when: total > pageSize * pageNo,
        get fallback() {
          return ssr(_tmpl$64, escape(createComponent(NavigateNextIcon, {})));
        },
        get children() {
          return ssr(_tmpl$216, ssrAttribute("href", escape(pageUrl(pageNo + 1), true), false), escape(createComponent(NavigateNextIcon, {})));
        }
      })));
    }
  })];
};
var DcardList_default = DcardList;

// src/youlog_lib/dcard/DcardItems.tsx
var _tmpl$40 = ["<ul>", "</ul>"];
var _tmpl$217 = ["<li><a", ">", "</a></li>"];
var DcardItems = (props) => {
  const ctx = props.page_context;
  const requestId = ctx.request_id;
  const {
    items
  } = everkm.posts(requestId, {
    dir: props.dir,
    recursive: props.recursive ?? true,
    tags: props.tags,
    exclude_tags: props.exclude_tags,
    categories: props.categories,
    include_myself: props.include_myself,
    limit: props.limit && props.limit > 0 ? Math.floor(props.limit) : void 0,
    order_by: props.order_by,
    order_direction: props.order_direction
  });
  return ssr(_tmpl$40, escape(createComponent(For, {
    each: items,
    children: (doc) => ssr(_tmpl$217, ssrAttribute("href", escape(doc.url_path, true), false), escape(doc.title))
  })));
};
var DcardItems_default = DcardItems;

// src/dcard/index.tsx
async function renderDcard(name, props) {
  const html = await renderToStringAsync(() => {
    switch (name) {
      case "list2":
        return createComponent(DcardList_default, mergeProps({
          get page_context() {
            return props.page_context;
          }
        }, props));
      case "items":
        return createComponent(DcardItems_default, mergeProps({
          get page_context() {
            return props.page_context;
          }
        }, props));
      default:
        throw new Error(`Dcard ${name} not found`);
    }
  });
  return html;
}

// src/entries/jsrender.ts
function ping() {
  return "pong";
}
export {
  ping,
  renderDcard,
  renderPage
};
