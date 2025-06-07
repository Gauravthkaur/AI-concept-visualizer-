# IntelliGraph

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)

IntelliGraph is an AI-powered application that helps users visualize and analyze data through interactive graphs and charts, powered by Gemini AI.

## ✨ Features

- Interactive graph visualization
- AI-powered data analysis
- Real-time data processing
- User-friendly interface
- Customizable graph parameters
- Export functionality for graphs and reports

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/intelligraph.git
   cd intelligraph
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Gemini AI](https://ai.google.dev/) - AI/ML capabilities
- [React Flow](https://reactflow.dev/) - Interactive graph visualization
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📁 Project Structure

```
intelligraph/
├── components/               # Reusable UI components
│   ├── ApiKeyModal.tsx       # Modal for API key input
│   ├── Button.tsx            # Custom button component
│   ├── CustomNode.tsx        # Custom node component for diagrams
│   ├── DiagramView.tsx       # Main diagram visualization
│   ├── Header.tsx            # Application header
│   ├── InputArea.tsx         # Text input area for user queries
│   ├── LoadingSpinner.tsx    # Loading indicator
│   ├── MermaidDiagramRenderer.tsx  # Renders Mermaid diagrams
│   ├── MermaidHistoryLog.tsx  # Displays diagram generation history
│   └── Sidebar.tsx           # Side navigation panel
├── services/                 # Application services
│   ├── apiKeyService.ts      # Manages API key operations
│   ├── geminiService.ts      # Handles Gemini AI API interactions
│   └── localStorageService.ts # Manages browser storage
├── public/                   # Static assets
├── App.tsx                   # Main application component
├── index.tsx                 # Application entry point
├── index.html                # HTML template
├── types.ts                  # TypeScript type definitions
├── utils.ts                  # Utility functions
├── constants.ts              # Application constants
├── vite.config.ts            # Vite configuration
└── package.json              # Project dependencies and scripts
```

Key files and their purposes:
- `App.tsx`: Main application component that orchestrates the app
- `components/`: Contains all React components
  - `InputArea.tsx`: Handles user input and query submission
  - `DiagramView.tsx`: Renders the generated diagrams
  - `Sidebar.tsx`: Contains navigation and history
- `services/geminiService.ts`: Core service for AI interactions
- `types.ts`: Centralized TypeScript type definitions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - your.email@example.com

Project Link: [https://github.com/yourusername/intelligraph](https://github.com/yourusername/intelligraph)
