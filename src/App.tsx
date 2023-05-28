import React from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [fileContent, setFileContent] = React.useState("");

  function convertCode(code: string): string {
    // Match variable = variable & "..."
    const pattern1 = /(\w+) = \1 & "(.*)"/;
    // Match variable = variable & "..." & variable & "..."
    const pattern2 = /(\w+) = \1 & "(.*)" & (.*) & "(.*)"/;
    // Match If ... Then
    const pattern3 = /If (.*) Then/;
    // Match ... ElseIf ... Then
    const pattern4 = /ElseIf (.*) Then/;
    // Match ... End If
    const pattern5 = /End If/;
    // Match ' comment
    const pattern6 = /^\s*'(.*)/;
    // Match ; followed by ' comment
    const pattern7 = /;\s*'(.*)/;
    // Match " & variable & "
    const pattern8 = /" & (.*) & "/;
    // Match ... Else
    const pattern9 = /Else/;

    // First match pattern6
    if (pattern6.test(code)) {
      code = code.replace(pattern6, "// $1");
    } else {
      // Replace matched patterns
      code = code.replace(pattern1, "$1 = Prisma.sql` ${$1} $2`;");
      code = code.replace(pattern2, "$1 = Prisma.sql` ${$1} $2 ${$3} $4`;");

      // code = code.replace(
      //   pattern3,
      //   (m) =>
      //     `if (${m[1].replace(/ And /g, " && ").replace(/ OR /g, " || ")}) {`
      // );
      // code = code.replace(pattern3, "if ($1) {");

      // code = code.replace(pattern4, "} else if ($1) {");
      code = code.replace(
        pattern3,
        (match, p1) =>
          `if (${p1
            .replace(/ And /g, " && ")
            .replace(/ OR /g, " || ")
            .replace(/<>/g, " != ")}) {`
      );
      code = code.replace(
        pattern4,
        (match, p1) =>
          `} else if (${p1
            .replace(/ And /g, " && ")
            .replace(/ OR /g, " || ")
            .replace(/<>/g, " != ")}) {`
      );

      code = code.replace(pattern5, "}");
      // Match pattern7
      code = code.replace(pattern7, "; //$1");

      // Match pattern8
      code = code.replace(pattern8, "${$1}");

      code = code.replace(pattern9, "} else {");
      code = code.replace(/ with ur/g, "");
    }

    return code;
  }
  const processLine = (line: string) => convertCode(line);

  const processFileContent = (content: string) => {
    const lines = content.split("\n");
    const processedLines = lines.map(processLine);
    return processedLines.join("\n");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(processFileContent(e.target!.result as string));
      };
      reader.readAsText(file);
    }
  };
  return (
    <div>
      <label>选择文件，注意文件格式为UTF-8</label>
      <input type="file" onChange={handleFileChange} />
      <textarea
        style={{
          maxHeight: "90vh",
          maxWidth: "70vw",
          minWidth: "50vw",
          minHeight: "70vh",
        }}
        //ref={textAreaRef}
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
      />
    </div>
  );
}

export default App;
