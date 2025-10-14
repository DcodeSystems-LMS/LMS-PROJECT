# Interactive Code Playground Setup

This document explains how to set up and use the Interactive Code Playground component.

## Features

- **Multi-language Support**: Python, C, C++, Java, JavaScript
- **Real-time Code Execution**: Using Judge0 API
- **Interactive Console**: Handle user input and display output
- **Modern UI**: Dark theme with syntax highlighting
- **Monaco Editor**: Full-featured code editor with IntelliSense

## Components Created

### 1. CodePlayground.tsx
The main playground component with:
- Monaco Editor integration
- Language selection
- Code execution
- Interactive console
- Input handling

### 2. UI Components
- `src/components/ui/select.tsx` - Custom Select component
- `src/components/ui/alert.tsx` - Alert component with variants
- `src/components/ui/ImageWithFallback.tsx` - Image component with error fallback

### 3. Demo Components
- `src/pages/playground/page.tsx` - Playground page
- `src/components/PlaygroundDemo.tsx` - Demo component with landing page

## Setup Instructions

### 1. Dependencies
The following dependencies are already installed:
- `@monaco-editor/react` - Monaco Editor React wrapper
- `lucide-react` - Icon library
- `axios` - HTTP client for API calls

### 2. Free API Setup
The playground uses your existing free Judge0 CE API integration:

- **Judge0 CE API** - Completely free, no authentication required
- **Interactive Input Support** - Handles programs that need user input
- **12 Programming Languages** - Python, JavaScript, Java, C++, C, Go, Ruby, PHP, Rust, Swift, Kotlin, TypeScript
- **Error Handling** - Comprehensive compilation and runtime error detection

**Already configured and ready to use!** 🎉

### 3. Usage

#### Basic Usage
```tsx
import CodePlayground from './components/CodePlayground';

function App() {
  return (
    <CodePlayground 
      onBack={() => console.log('Back clicked')} 
    />
  );
}
```

#### With Demo Component
```tsx
import PlaygroundDemo from './components/PlaygroundDemo';

function App() {
  return <PlaygroundDemo />;
}
```

## Free API Integration

The playground uses multiple free services with automatic fallbacks:

```typescript
// Primary: Judge0 CE API (free tier)
const result = await freeCodeExecutionService.executeCode({
  code: "print('Hello World')",
  language: "python",
  stdin: ""
});

// Automatic fallbacks:
// 1. Judge0 CE API (free)
// 2. CodeX API (free) 
// 3. Demo simulation (offline)
```

## Supported Languages

| Language | ID | Monaco ID | Extension |
|----------|----|-----------|-----------| 
| Python   | 71 | python    | .py       |
| JavaScript | 63 | javascript | .js      |
| Java     | 62 | java      | .java     |
| C++      | 54 | cpp       | .cpp      |
| C        | 50 | c         | .c        |
| Go       | 60 | go        | .go       |
| Ruby     | 72 | ruby      | .rb       |
| PHP      | 68 | php       | .php      |
| Rust     | 73 | rust      | .rs       |
| Swift    | 83 | swift     | .swift    |
| Kotlin   | 78 | kotlin    | .kt       |
| TypeScript | 74 | typescript | .ts      |

## Features

### Code Editor
- Syntax highlighting
- Auto-completion
- Error detection
- Multiple themes
- Line numbers
- Word wrap

### Console
- Real-time output
- Error handling
- Input collection
- Execution status
- Performance metrics

### Input Handling
- Automatic input detection
- Multi-line input support
- Interactive prompts
- Input validation

## Styling

The playground uses Tailwind CSS with a dark theme:
- Background: `bg-slate-950`
- Console: `bg-slate-900`
- Borders: `border-white/10`
- Text: Various opacity levels for hierarchy

## Customization

### Adding New Languages
Add to the `LANGUAGES` array in `CodePlayground.tsx`:

```typescript
const LANGUAGES = [
  // ... existing languages
  { 
    id: 68, 
    name: "PHP", 
    monacoId: "php", 
    defaultCode: '<?php\necho "Hello, World!";\n?>' 
  }
];
```

### Custom Themes
Modify the Monaco Editor theme in the `Editor` component:

```tsx
<Editor
  theme="vs-dark" // or "vs-light"
  // ... other props
/>
```

## Error Handling

The playground handles various error scenarios:
- API key configuration
- Network errors
- Compilation errors
- Runtime errors
- Input validation

## Performance

- Lazy loading of Monaco Editor
- Efficient console updates
- Optimized re-renders
- Memory management for long-running processes

## Browser Support

- Modern browsers with ES6+ support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure you've configured your RapidAPI key
2. **CORS Issues**: The Judge0 API handles CORS properly
3. **Monaco Editor Not Loading**: Check if the component is properly imported
4. **Console Not Updating**: Ensure the console ref is properly set

### Debug Mode
Enable debug logging by adding to your environment:

```typescript
// In CodePlayground.tsx
const DEBUG = process.env.NODE_ENV === 'development';
```

## Contributing

When adding new features:
1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Test with multiple languages
5. Update documentation

## License

This playground component is part of the dcode-platform project.
