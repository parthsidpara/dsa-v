let jsPlumbInstance;
        let nodes = [];

        document.addEventListener("DOMContentLoaded", function () {
            jsPlumbInstance = jsPlumb.getInstance({
                Connector: ["Straight"],
                Anchors: ["Right", "Left"],
                Endpoint: ["Dot", { radius: 5 }],
                PaintStyle: { stroke: "#3B82F6", strokeWidth: 2 },
                EndpointStyle: { fill: "#3B82F6", outlineStroke: "transparent" },
            });
            jsPlumbInstance.setContainer("visualizer");
            updateCode();
            updateNodeCount();

            // Add event listener for the copy button
            document.getElementById("copyButton").addEventListener("click", copyGeneratedCode);
        });

        function addNode() {
            const value = document.getElementById("nodeValue").value;
            if (value === "") return;

            const node = document.createElement("div");
            node.className = "absolute w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold shadow-md";
            node.textContent = value;

            const visualizer = document.getElementById("visualizer");
            const visualizerRect = visualizer.getBoundingClientRect();
            const nodeSpacing = 100;
            const nodeSize = 48;

            node.style.left = `${nodes.length * nodeSpacing}px`;
            node.style.top = `${(visualizerRect.height - nodeSize) / 2}px`;

            visualizer.appendChild(node);
            jsPlumbInstance.draggable(node, { containment: true });

            if (nodes.length > 0) {
                jsPlumbInstance.connect({
                    source: nodes[nodes.length - 1],
                    target: node,
                    anchor: ["Right", "Left"],
                    endpoint: "Blank",
                    connector: ["Straight", { stub: 30 }],
                    overlays: [
                        ["Arrow", { location: 1, width: 10, length: 10 }]
                    ]
                });
            }

            nodes.push(node);
            updateCode();
            updateNodeCount();
        }

        function removeNode() {
            if (nodes.length === 0) return;

            const removedNode = nodes.pop();
            jsPlumbInstance.remove(removedNode);
            updateCode();
            updateNodeCount();
        }

        function updateCode() {
            const codeOutput = document.getElementById("codeOutput");
            let code = `#include <iostream>

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
private:
    Node* head;

public:
    LinkedList() : head(nullptr) {}

    void append(int val) {
        Node* newNode = new Node(val);
        if (!head) {
            head = newNode;
            return;
        }
        Node* current = head;
        while (current->next) {
            current = current->next;
        }
        current->next = newNode;
    }

    void display() {
        Node* current = head;
        while (current) {
            std::cout << current->data << " -> ";
            current = current->next;
        }
        std::cout << "nullptr" << std::endl;
    }
};

int main() {
    LinkedList list;
${nodes.map(node => `    list.append(${node.textContent});`).join('\n')}

    list.display();
    return 0;
}`;

            codeOutput.textContent = code;
        }

        function updateNodeCount() {
            document.getElementById("nodeCount").textContent = nodes.length;
        }

        function copyGeneratedCode() {
            const codeOutput = document.getElementById("codeOutput");
            const copyButton = document.getElementById("copyButton");

            // Create a temporary textarea element to hold the code
            const tempTextArea = document.createElement("textarea");
            tempTextArea.value = codeOutput.textContent;
            document.body.appendChild(tempTextArea);

            // Select and copy the code
            tempTextArea.select();
            document.execCommand("copy");

            // Remove the temporary textarea
            document.body.removeChild(tempTextArea);

            // Provide visual feedback
            copyButton.textContent = "Copied!";
            copyButton.classList.add("bg-green-500");
            copyButton.classList.remove("bg-primary");

            // Reset the button after 2 seconds
            setTimeout(() => {
                copyButton.textContent = "Copy Code";
                copyButton.classList.remove("bg-green-500");
                copyButton.classList.add("bg-primary");
            }, 2000);
        }