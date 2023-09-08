# ILI File Highlighter


![image](https://user-images.githubusercontent.com/3465512/194811328-616104ab-5855-44e6-a5ec-0997d6403f59.png)


## Description
A Visual Studio Code extension for adding color highlighting to INTERLIS 2.4 files. The colors are customizable but by default the current color theme's colors are used. In addition, this extension provides snippets for commonly used blocks in INTERLIS 2.

**Note**

## Features
### Syntax Highlighting
The extension associates with `.ILI` files and applies coloring to the different elements in the file, for example:

* Object names like
    * `TOPIC`
    * `MODEL`
    * `CLASS`
* Data types like
    * `BOOLEAN`
    * `TEXT`
* Keywords like
    * `ASSOCIATION`
    * `ABSTRACT`
    * `EXTENDS`
* String patterns like
    * `{...}`

### Snippets
The extension provides interactive snippets for commonly used INTERLIS 2 blocks. To use the snippets start by typing the name of the block until VSC provides the correct option as suggestion. Select the snippet with the arrow keys and hit `ENTER` to insert. Navigate through the snippet and its options with `TAB`.

Supported snippets include: `MODEL`, `TOPIC`, `CLASS`, `STRUCTURE`, `ASSOCIATION` and `Role`

### File associations

To make VS Code treat other file extensions than the default `.ili` as INTERLIS2 files, add the following to the user settings:

```JSON
"files.associations": {
    "*.ili*": "INTERLIS2"
},
```
The example above associates extensions such as `.ili` with the INTERLIS2 File highlighter extension.
