# 🚀 Interactive Code Playground Examples

## How to Test the Interactive Console

### 1. Python Examples

#### Basic Input Example
```python
name = input("Enter your name: ")
print(f"Hello, {name}!")
```

**Expected Console Flow:**
1. Click "Run Code"
2. Console shows: "Running code..."
3. Console shows: ">> " (waiting for input)
4. Type your name and press Enter
5. Console shows: "Hello, [your name]!"
6. Console shows: "Program completed successfully."

#### Multiple Inputs Example
```python
age = int(input("Enter your age: "))
height = float(input("Enter your height (in cm): "))
print(f"You are {age} years old and {height}cm tall.")
```

#### Calculator Example
```python
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
operation = input("Enter operation (+, -, *, /): ")

if operation == '+':
    result = num1 + num2
elif operation == '-':
    result = num1 - num2
elif operation == '*':
    result = num1 * num2
elif operation == '/':
    result = num1 / num2
else:
    result = "Invalid operation"

print(f"Result: {result}")
```

### 2. C Examples

#### Basic C Input
```c
#include <stdio.h>
int main() {
    char name[50];
    printf("Enter your name: ");
    scanf("%s", name);
    printf("Hello, %s!\n", name);
    return 0;
}
```

#### Number Input
```c
#include <stdio.h>
int main() {
    int num;
    printf("Enter a number: ");
    scanf("%d", &num);
    printf("You entered: %d\n", num);
    return 0;
}
```

### 3. JavaScript Examples

#### Node.js Input
```javascript
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('What is your name? ', (name) => {
    console.log(`Hello, ${name}!`);
    rl.close();
});
```

### 4. Java Examples

#### Scanner Input
```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}
```

## 🎯 Interactive Features

### ✅ What Works:
- **Real-time input**: Type directly in the console when prompted
- **Input history**: Use ↑/↓ arrows to navigate previous inputs
- **Terminal styling**: Dark background with colored text
- **Blinking cursor**: Visual feedback when waiting for input
- **Auto-scroll**: Console automatically scrolls to show new content
- **Error handling**: Clear error messages for compilation/runtime errors
- **Multiple languages**: Works with Python, C, C++, Java, JavaScript, Go, PHP, Ruby

### 🎨 Console Color Coding:
- **Green**: Normal output and prompts
- **Blue**: User input
- **Yellow**: System messages
- **Red**: Errors
- **Blinking cursor**: When waiting for input

### ⌨️ Keyboard Shortcuts:
- **Enter**: Submit input
- **↑/↓**: Navigate input history
- **Ctrl/Cmd + Enter**: Run code from editor

## 🧪 Testing Steps

1. **Start the playground**: Navigate to `/playground`
2. **Select Python**: Choose Python from the language dropdown
3. **Copy the example code**: Use any of the examples above
4. **Click "Run Code"**: The console will show "Running code..."
5. **Wait for input prompt**: You'll see ">> " in the console
6. **Type your input**: Type something and press Enter
7. **See the result**: The output will appear in the console
8. **Try multiple inputs**: Use the calculator example for multiple inputs

## 🐛 Troubleshooting

**If input doesn't work:**
- Make sure you're using the correct input functions for each language
- Check that the code is syntactically correct
- Try with simple examples first

**If console doesn't show input prompt:**
- The code might not be waiting for input
- Check for compilation errors
- Try the basic Python example first

**If styling looks wrong:**
- Check that TailwindCSS is loaded
- Verify the console has the correct classes
- Try refreshing the page

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Console shows ">> " prompt
- ✅ You can type in the console
- ✅ Input appears in blue text
- ✅ Output appears in green text
- ✅ Cursor blinks when waiting for input
- ✅ Console auto-scrolls to show new content
