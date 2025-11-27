# Java Class Name Compilation Error Fix

## Problem

When running Java code in the playground, you may encounter this error:

```
Main.java:3: error: class SumOfNumbers is public, should be declared in a file named SumOfNumbers.java
public class SumOfNumbers {
       ^
1 error
Status: Compilation Error
```

## Root Cause

Java requires that **public classes must be declared in a file with the same name**. Judge0 compiles Java code as `Main.java` by default, so:

- ✅ `public class Main` → Works (matches filename)
- ❌ `public class SumOfNumbers` → Fails (doesn't match filename)
- ✅ `class SumOfNumbers` → Works (non-public class doesn't need matching filename)

## Solution Implemented

A **Java code preprocessor** has been added to `src/lib/judge0Client.ts` that automatically:

1. **Detects** if the code is Java (language ID 62)
2. **Checks** if there's a `public class` that's not named `Main`
3. **Removes** the `public` keyword to make it a non-public class
4. **Preserves** the original class name

### Example Transformation

**Before:**
```java
public class SumOfNumbers {
    public static void main(String[] args) {
        // code
    }
}
```

**After (automatically):**
```java
class SumOfNumbers {
    public static void main(String[] args) {
        // code
    }
}
```

## How It Works

The preprocessing function:
- Uses regex to find `public class <ClassName>`
- Checks if the class name is not `Main`
- Removes `public` keyword if needed
- Leaves the code unchanged if class is already `Main` or not public

## Benefits

✅ **No user action required** - Fix happens automatically  
✅ **Preserves class names** - Your class name stays the same  
✅ **Works with any class name** - `SumOfNumbers`, `Calculator`, etc.  
✅ **Backward compatible** - Code with `public class Main` still works  

## Testing

To test the fix:

1. Write Java code with a public class that's not `Main`:
   ```java
   public class SumOfNumbers {
       public static void main(String[] args) {
           System.out.println("Hello");
       }
   }
   ```

2. Run the code - it should compile and execute successfully

3. The class will automatically be converted to:
   ```java
   class SumOfNumbers {
       public static void main(String[] args) {
           System.out.println("Hello");
       }
   }
   ```

## Alternative Solutions (Not Implemented)

### Option 1: Rename class to Main
- **Pros**: Keeps `public` keyword
- **Cons**: Changes user's class name, may break code that references the class name

### Option 2: Use Judge0 filename parameter
- **Pros**: Would allow custom filenames
- **Cons**: Judge0 API may not support this parameter

### Option 3: User education
- **Pros**: Users learn Java rules
- **Cons**: Requires manual action, poor UX

## Files Modified

- ✅ `src/lib/judge0Client.ts` - Added `preprocessJavaCode()` function and integrated it into `submitCode()`

## Notes

- The fix only applies to Java code (language ID 62)
- Other languages are unaffected
- The preprocessing is transparent to the user
- Original code in the editor is not modified (only the submitted code is preprocessed)

