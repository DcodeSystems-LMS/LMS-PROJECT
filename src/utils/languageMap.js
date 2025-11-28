// Language mapping utility for code playground
// Maps language names to Judge0 API language IDs and provides default code templates

const LANGUAGES = {
  'Python': {
    id: 71,
    name: 'Python',
    extension: 'py',
    monacoLanguage: 'python',
    defaultCode: `# Python Code with full library support
import math
import random
import datetime
import json
import os

print("Hello, World!")

# Your code here
name = input("Enter your name: ")
print(f"Hello, {name}!")

# Example with libraries
print(f"Random number: {random.randint(1, 100)}")
print(f"Square root of 16: {math.sqrt(16)}")
print(f"Current time: {datetime.datetime.now()}")`
  },
  'JavaScript': {
    id: 63,
    name: 'JavaScript',
    extension: 'js',
    monacoLanguage: 'javascript',
    defaultCode: `// JavaScript Code with full Node.js support
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log("Hello, World!");

// Your code here
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your name: ', (name) => {
  console.log(\`Hello, \${name}!\`);
  
  // Example with libraries
  console.log(\`Random number: \${Math.floor(Math.random() * 100)}\`);
  console.log(\`Current time: \${new Date()}\`);
  console.log(\`Hash of your name: \${crypto.createHash('md5').update(name).digest('hex')}\`);
  
  rl.close();
});`
  },
  'Java': {
    id: 62,
    name: 'Java',
    extension: 'java',
    monacoLanguage: 'java',
    defaultCode: `// Java Code with full library support
import java.util.*;
import java.time.*;
import java.math.*;
import java.security.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Your code here
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        
        // Example with libraries
        Random random = new Random();
        System.out.println("Random number: " + random.nextInt(100));
        System.out.println("Current time: " + LocalDateTime.now());
        System.out.println("Square root of 16: " + Math.sqrt(16));
        
        scanner.close();
    }
}`
  },
  'C++': {
    id: 54,
    name: 'C++',
    extension: 'cpp',
    monacoLanguage: 'cpp',
    defaultCode: `// C++ Code with full STL support
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <random>
#include <chrono>
#include <cmath>
#include <iomanip>

using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Your code here
    string name;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Hello, " << name << "!" << endl;
    
    // Example with STL libraries
    vector<int> numbers = {1, 2, 3, 4, 5};
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(1, 100);
    
    cout << "Random number: " << dis(gen) << endl;
    cout << "Square root of 16: " << sqrt(16) << endl;
    cout << "Current time: " << chrono::duration_cast<chrono::milliseconds>(chrono::system_clock::now().time_since_epoch()).count() << " ms" << endl;
    
    return 0;
}`
  },
  'C': {
    id: 50,
    name: 'C',
    extension: 'c',
    monacoLanguage: 'c',
    defaultCode: `// C Code
#include <stdio.h>
#include <string.h>

int main() {
    printf("Hello, World!\\n");
    
    // Your code here
    char name[100];
    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\\n")] = 0; // Remove newline
    printf("Hello, %s!\\n", name);
    
    return 0;
}`
  },
  'Go': {
    id: 60,
    name: 'Go',
    extension: 'go',
    monacoLanguage: 'go',
    defaultCode: `// Go Code with full standard library support
package main

import (
    "fmt"
    "bufio"
    "os"
    "math/rand"
    "time"
    "math"
    "crypto/md5"
    "encoding/hex"
)

func main() {
    fmt.Println("Hello, World!")
    
    // Your code here
    reader := bufio.NewReader(os.Stdin)
    fmt.Print("Enter your name: ")
    name, _ := reader.ReadString('\\n')
    fmt.Printf("Hello, %s!", name)
    
    // Example with libraries
    rand.Seed(time.Now().UnixNano())
    fmt.Printf("Random number: %d\\n", rand.Intn(100))
    fmt.Printf("Square root of 16: %.2f\\n", math.Sqrt(16))
    fmt.Printf("Current time: %s\\n", time.Now().Format("2006-01-02 15:04:05"))
    
    // Hash example
    hash := md5.Sum([]byte(name))
    fmt.Printf("Hash of your name: %s\\n", hex.EncodeToString(hash[:]))
}`
  },
  'Ruby': {
    id: 72,
    name: 'Ruby',
    extension: 'rb',
    monacoLanguage: 'ruby',
    defaultCode: `# Ruby Code with full standard library support
require 'digest'
require 'time'
require 'json'

puts "Hello, World!"

# Your code here
print "Enter your name: "
name = gets.chomp
puts "Hello, #{name}!"

# Example with libraries
puts "Random number: #{rand(100)}"
puts "Square root of 16: #{Math.sqrt(16)}"
puts "Current time: #{Time.now}"
puts "Hash of your name: #{Digest::MD5.hexdigest(name)}"

# JSON example
data = { name: name, timestamp: Time.now.to_i }
puts "JSON data: #{data.to_json}"`
  },
  'PHP': {
    id: 68,
    name: 'PHP',
    extension: 'php',
    monacoLanguage: 'php',
    defaultCode: `<?php
// PHP Code with full standard library support
echo "Hello, World!\\n";

// Your code here
echo "Enter your name: ";
$name = trim(fgets(STDIN));
echo "Hello, $name!\\n";

// Example with libraries
echo "Random number: " . rand(1, 100) . "\\n";
echo "Square root of 16: " . sqrt(16) . "\\n";
echo "Current time: " . date('Y-m-d H:i:s') . "\\n";
echo "Hash of your name: " . md5($name) . "\\n";

// JSON example
$data = array('name' => $name, 'timestamp' => time());
echo "JSON data: " . json_encode($data) . "\\n";
?>`
  },
  'Rust': {
    id: 73,
    name: 'Rust',
    extension: 'rs',
    monacoLanguage: 'rust',
    defaultCode: `// Rust Code with full standard library support
use std::io;
use std::time::{SystemTime, UNIX_EPOCH};
use std::collections::HashMap;
use rand::Rng;

fn main() {
    println!("Hello, World!");
    
    // Your code here
    println!("Enter your name:");
    let mut name = String::new();
    io::stdin().read_line(&mut name).expect("Failed to read line");
    println!("Hello, {}!", name.trim());
    
    // Example with libraries
    let mut rng = rand::thread_rng();
    println!("Random number: {}", rng.gen_range(1..=100));
    println!("Square root of 16: {}", 16.0_f64.sqrt());
    
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    println!("Current timestamp: {}", now);
    
    // HashMap example
    let mut map = HashMap::new();
    map.insert("name", name.trim());
    map.insert("timestamp", &now.to_string());
    println!("HashMap: {:?}", map);
}`
  },
  'Swift': {
    id: 83,
    name: 'Swift',
    extension: 'swift',
    monacoLanguage: 'swift',
    defaultCode: `// Swift Code with full Foundation support
import Foundation

print("Hello, World!")

// Your code here
print("Enter your name:", terminator: " ")
if let name = readLine() {
    print("Hello, \\(name)!")
    
    // Example with libraries
    let randomNumber = Int.random(in: 1...100)
    print("Random number: \\(randomNumber)")
    print("Square root of 16: \\(sqrt(16))")
    print("Current time: \\(Date())")
    
    // Hash example
    let data = name.data(using: .utf8)!
    let hash = data.withUnsafeBytes { bytes in
        return bytes.bindMemory(to: UInt8.self)
    }
    let hashString = hash.map { String(format: "%02x", $0) }.joined()
    print("Hash of your name: \\(hashString)")
    
    // JSON example
    let jsonData: [String: Any] = ["name": name, "timestamp": Date().timeIntervalSince1970]
    if let json = try? JSONSerialization.data(withJSONObject: jsonData),
       let jsonString = String(data: json, encoding: .utf8) {
        print("JSON data: \\(jsonString)")
    }
}`
  },
  'Kotlin': {
    id: 78,
    name: 'Kotlin',
    extension: 'kt',
    monacoLanguage: 'kotlin',
    defaultCode: `// Kotlin Code with full standard library support
import kotlin.random.Random
import kotlin.math.sqrt
import java.time.LocalDateTime
import java.security.MessageDigest

fun main() {
    println("Hello, World!")
    
    // Your code here
    print("Enter your name: ")
    val name = readLine()
    println("Hello, $name!")
    
    // Example with libraries
    println("Random number: \${Random.nextInt(1, 101)}")
    println("Square root of 16: \${sqrt(16.0)}")
    println("Current time: \${LocalDateTime.now()}")
    
    // Hash example
    val bytes = name?.toByteArray() ?: byteArrayOf()
    val md = MessageDigest.getInstance("MD5")
    val digest = md.digest(bytes)
    val hashString = digest.joinToString("") { "%02x".format(it) }
    println("Hash of your name: $hashString")
    
    // Map example
    val data = mapOf("name" to name, "timestamp" to System.currentTimeMillis())
    println("Map data: $data")
}`
  },
  'TypeScript': {
    id: 74,
    name: 'TypeScript',
    extension: 'ts',
    monacoLanguage: 'typescript',
    defaultCode: `// TypeScript Code with full Node.js support
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log("Hello, World!");

// Your code here
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your name: ', (name: string) => {
  console.log(\`Hello, \${name}!\`);
  
  // Example with libraries
  console.log(\`Random number: \${Math.floor(Math.random() * 100)}\`);
  console.log(\`Square root of 16: \${Math.sqrt(16)}\`);
  console.log(\`Current time: \${new Date()}\`);
  console.log(\`Hash of your name: \${crypto.createHash('md5').update(name).digest('hex')}\`);
  
  // TypeScript features
  interface UserData {
    name: string;
    timestamp: number;
  }
  
  const userData: UserData = {
    name: name,
    timestamp: Date.now()
  };
  
  console.log(\`User data: \${JSON.stringify(userData)}\`);
  
  rl.close();
});`
  },
  'C#': {
    id: 51,
    name: 'C#',
    extension: 'cs',
    monacoLanguage: 'csharp',
    defaultCode: `// C# Code with full .NET support
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, World!");
        
        // Your code here
        Console.Write("Enter your name: ");
        string name = Console.ReadLine();
        Console.WriteLine($"Hello, {name}!");
        
        // Example with libraries
        Random random = new Random();
        Console.WriteLine($"Random number: {random.Next(1, 101)}");
        Console.WriteLine($"Square root of 16: {Math.Sqrt(16)}");
        Console.WriteLine($"Current time: {DateTime.Now}");
        
        // Hash example
        using (MD5 md5 = MD5.Create())
        {
            byte[] inputBytes = Encoding.ASCII.GetBytes(name);
            byte[] hashBytes = md5.ComputeHash(inputBytes);
            string hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            Console.WriteLine($"Hash of your name: {hash}");
        }
        
        // Dictionary example
        var data = new Dictionary<string, object>
        {
            {"name", name},
            {"timestamp", DateTimeOffset.Now.ToUnixTimeSeconds()}
        };
        Console.WriteLine($"Dictionary data: {string.Join(", ", data)}");
    }
}`
  },
  'Scala': {
    id: 81,
    name: 'Scala',
    extension: 'scala',
    monacoLanguage: 'scala',
    defaultCode: `// Scala Code with full standard library support
import scala.util.Random
import scala.math.sqrt
import java.time.LocalDateTime
import java.security.MessageDigest

object Main {
  def main(args: Array[String]): Unit = {
    println("Hello, World!")
    
    // Your code here
    print("Enter your name: ")
    val name = scala.io.StdIn.readLine()
    println(s"Hello, $name!")
    
    // Example with libraries
    val random = new Random()
    println(s"Random number: \${random.nextInt(100) + 1}")
    println(s"Square root of 16: \${sqrt(16)}")
    println(s"Current time: \${LocalDateTime.now()}")
    
    // Hash example
    val md = MessageDigest.getInstance("MD5")
    val hashBytes = md.digest(name.getBytes("UTF-8"))
    val hashString = hashBytes.map("%02x".format(_)).mkString
    println(s"Hash of your name: $hashString")
    
    // Map example
    val data = Map("name" -> name, "timestamp" -> System.currentTimeMillis())
    println(s"Map data: $data")
  }
}`
  },
  'Perl': {
    id: 85,
    name: 'Perl',
    extension: 'pl',
    monacoLanguage: 'perl',
    defaultCode: `# Perl Code with full CPAN support
use strict;
use warnings;
use Digest::MD5 qw(md5_hex);
use Time::Piece;
use JSON;

print "Hello, World!\\n";

# Your code here
print "Enter your name: ";
my $name = <STDIN>;
chomp($name);
print "Hello, $name!\\n";

# Example with libraries
my $random = int(rand(100)) + 1;
print "Random number: $random\\n";
print "Square root of 16: " . sqrt(16) . "\\n";
print "Current time: " . localtime() . "\\n";

# Hash example
my $hash = md5_hex($name);
print "Hash of your name: $hash\\n";

# JSON example
my $data = {
    name => $name,
    timestamp => time()
};
my $json = encode_json($data);
print "JSON data: $json\\n";`
  },
  'Haskell': {
    id: 61,
    name: 'Haskell',
    extension: 'hs',
    monacoLanguage: 'haskell',
    defaultCode: `-- Haskell Code with full standard library support
import System.Random
import Data.Time
import Data.Digest.Pure.MD5
import Data.ByteString.Lazy.Char8 (pack)

main :: IO ()
main = do
    putStrLn "Hello, World!"
    
    -- Your code here
    putStr "Enter your name: "
    name <- getLine
    putStrLn $ "Hello, " ++ name ++ "!"
    
    -- Example with libraries
    gen <- newStdGen
    let (random, _) = randomR (1, 100) gen
    putStrLn $ "Random number: " ++ show random
    putStrLn $ "Square root of 16: " ++ show (sqrt 16)
    
    now <- getCurrentTime
    putStrLn $ "Current time: " ++ show now
    
    -- Hash example
    let hash = md5 $ pack name
    putStrLn $ "Hash of your name: " ++ show hash`
  }
};

/**
 * Get all available language names
 * @returns {Array<string>} Array of language names
 */
export const getAllLanguageNames = () => {
  return Object.keys(LANGUAGES);
};

/**
 * Get language object by name
 * @param {string} languageName - Name of the language
 * @returns {Object|null} Language object or null if not found
 */
export const getLanguageByName = (languageName) => {
  return LANGUAGES[languageName] || null;
};

/**
 * Get Judge0 API language ID by language name
 * @param {string} languageName - Name of the language
 * @returns {number|null} Language ID or null if not found
 */
export const getLanguageId = (languageName) => {
  const language = LANGUAGES[languageName];
  return language ? language.id : null;
};

/**
 * Get default code template for a language
 * @param {string} languageName - Name of the language
 * @returns {string} Default code template
 */
export const getDefaultCode = (languageName) => {
  const language = LANGUAGES[languageName];
  return language ? language.defaultCode : '';
};

/**
 * Get Monaco editor language identifier
 * @param {string} languageName - Name of the language
 * @returns {string} Monaco language identifier
 */
export const getMonacoLanguage = (languageName) => {
  const language = LANGUAGES[languageName];
  return language ? language.monacoLanguage : 'plaintext';
};

/**
 * Get file extension for a language
 * @param {string} languageName - Name of the language
 * @returns {string} File extension
 */
export const getFileExtension = (languageName) => {
  const language = LANGUAGES[languageName];
  return language ? language.extension : 'txt';
};

/**
 * Check if a language is supported
 * @param {string} languageName - Name of the language
 * @returns {boolean} True if language is supported
 */
export const isLanguageSupported = (languageName) => {
  return languageName in LANGUAGES;
};

export default LANGUAGES;
