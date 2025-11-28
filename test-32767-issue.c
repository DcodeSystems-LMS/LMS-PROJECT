// Test program to understand why 32767 is being used
#include <stdio.h>

int main() {
    int n;
    printf("Enter how many numbers you want to add: ");
    scanf("%d", &n);
    printf("Enter %d numbers:\n", n);
    
    for (int i = 1; i <= n; i++) {
        printf("Number %d: ", i);
        int num;
        scanf("%d", &num);
    }
    
    return 0;
}


