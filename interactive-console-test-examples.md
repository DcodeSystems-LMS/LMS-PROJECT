# 🧪 Interactive Console Test Examples

## Test the Enhanced Playground

### 🐍 Python Examples

#### 1. Basic Input Test
```python
name = input("Enter your name: ")
print(f"Hello, {name}!")
```

**Expected Console Flow:**
```
Running code...
Enter your name: 
>> [user types: John]
John
Hello, John!
Program completed successfully.
```

#### 2. Multiple Inputs Test
```python
age = int(input("Enter your age: "))
height = float(input("Enter your height: "))
print(f"You are {age} years old and {height}cm tall.")
```

#### 3. Calculator Test
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

### 🔧 C Examples

#### 1. Basic scanf Test
```c
#include <stdio.h>
int main() {
    int num;
    printf("Enter an integer: ");
    scanf("%d", &num);
    printf("You entered: %d\n", num);
    return 0;
}
```

#### 2. String Input Test
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

#### 3. Multiple Inputs Test
```c
#include <stdio.h>
int main() {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    printf("Sum: %d\n", a + b);
    return 0;
}
```

### ☕ Java Examples

#### 1. Scanner Test
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

#### 2. Multiple Inputs Test
```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        System.out.print("Enter your height: ");
        double height = scanner.nextDouble();
        System.out.println("You are " + age + " years old and " + height + "cm tall.");
        scanner.close();
    }
}
```

### 🟨 JavaScript Examples

#### 1. Node.js readline Test
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

### 🦀 Go Examples

#### 1. fmt.Scan Test
```go
package main

import "fmt"

func main() {
    var name string
    fmt.Print("Enter your name: ")
    fmt.Scan(&name)
    fmt.Printf("Hello, %s!\n", name)
}
```

## 🎯 How the Interactive Console Works

### 1. **Detection Phase**
- When you click "Run Code", the system first checks if your code contains input functions
- For Python: `input(`, `raw_input(`
- For C: `scanf(`, `gets(`
- For C++: `cin >>`, `getline(`
- For Java: `Scanner`, `nextLine(`
- And more for other languages

### 2. **Execution Phase**
- If input functions are detected, the system runs the code with empty stdin first
- This shows any prompts (like "Enter your name:") in the console
- Then it pauses and shows the `>> ` prompt for user input

### 3. **Input Phase**
- User types input directly in the console
- Press Enter to submit
- The system captures the input and runs the code again with that input
- Shows the complete output

### 4. **Visual Feedback**
- **Green text**: Normal output and prompts
- **Blue text**: User input
- **Yellow text**: System messages
- **Red text**: Errors
- **Blinking cursor**: When waiting for input

## 🧪 Testing Steps

1. **Copy any example above** into the code editor
2. **Select the correct language** from the dropdown
3. **Click "Run Code"**
4. **Watch the console** for prompts
5. **Type input** when you see `>> `
6. **Press Enter** to submit
7. **See the result** in the console

## 🐛 Troubleshooting

### If input doesn't work:
- Make sure you're using the correct input functions for each language
- Check that the code is syntactically correct
- Try the basic examples first

### If console doesn't show input prompt:
- The code might not contain input functions
- Check for compilation errors
- Try the Python `input()` example first

### If styling looks wrong:
- Check that TailwindCSS is loaded
- Verify the console has the correct classes
- Try refreshing the page

## ✅ Success Indicators

You'll know it's working when:
- ✅ Console shows prompts from your code
- ✅ Console shows `>> ` when waiting for input
- ✅ You can type in the console
- ✅ Input appears in blue text
- ✅ Output appears in green text
- ✅ Cursor blinks when waiting for input
- ✅ Console auto-scrolls to show new content

## 🎉 Advanced Features

- **Input History**: Use ↑/↓ arrows to navigate previous inputs
- **Multiple Inputs**: Works with programs that need multiple inputs
- **Error Handling**: Clear error messages for compilation/runtime errors
- **Auto-scroll**: Console automatically scrolls to show new content
- **Responsive**: Works on desktop and mobile devices
