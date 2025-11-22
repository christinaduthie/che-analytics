import fs from "node:fs";
import path from "node:path";
import * as recast from "recast";
import * as babelParser from "@babel/parser";

const parser = {
  parse(source) {
    return babelParser.parse(source, {
      sourceType: "module",
      plugins: [
        "jsx",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
        "importMeta",
        "topLevelAwait",
        "optionalChaining",
        "nullishCoalescingOperator",
      ],
      tokens: true,
    });
  },
};

function stripStyling(ast) {
  recast.types.visit(ast, {
    visitJSXAttribute(path) {
      const name = path.node.name?.name;
      if (name === "className" || name === "style") {
        path.prune();
        return false;
      }
      this.traverse(path);
      return undefined;
    },
  });
}

function processFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  let ast;
  try {
    console.log(`Parsing ${filePath}`);
    ast = recast.parse(source, { parser });
  } catch (error) {
    console.error(`Failed to parse ${filePath}`);
    throw error;
  }
  stripStyling(ast);
  const output = recast.print(ast).code;
  fs.writeFileSync(filePath, output);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if ([".js", ".jsx", ".ts", ".tsx"].includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

walk(path.resolve("src"));
