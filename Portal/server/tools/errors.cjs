class ToolError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
function check(condition, code, message, status) { if (!condition) throw new ToolError(code, message, status); }
module.exports = { ToolError, check };
