//
//  CUTEStringMatcher.m
//  currant
//
//  Created by Foster Yin on 7/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEStringMatcher.h"
#import "NSArray+ObjectiveSugar.h"
#import "NSObject+Attachment.h"

@implementation CUTEStringMatcher

#define TMIN(a, b, c) MIN(a, MIN(b, c))

int delCost = 6;
int insertCost = 6 ;//
int dist[32][32];
char dict[][11] = {"qwertyuiop","asdfghjkl*","zxcvbnm***"};

//??dist
void calcWeight() {
    int i , j , x , y ;
    for( i = 0 ; i < 3 ; i++) {
        for ( j = 0 ; j < 10 ; j++) {
            if ( dict[i][j] == '*' ) {
                break ;
            }
            //dict[i][j]
            for ( x = 0 ; x < 3 ; x++) {
                for ( y = 0 ; y < 10 ; y++) if( dict[x][y] != '*' ) {
                    dist[dict[i][j]-'a'][dict[x][y]-'a'] = abs(i-x)+abs(j-y);
                }
            }
        }
    }
}

+ (void)load {
    calcWeight();
}

//http://www.cprogramdevelop.com/623769/
+ (NSInteger)getWeightedLevenshteinDistanceFromSource:(NSString *)source toTarget:(NSString *)target {
    if ([source isEqualToString:target]) return 0;
    if (source.length == 0) return target.length;
    if (target.length == 0) return source.length;


    NSMutableArray *v0 = [NSMutableArray array];
    NSMutableArray *v1 = [NSMutableArray array];

    NSUInteger count = target.length + 1;
    for (int i = 0; i < count; i++)
    {
        [v0 addObject:@(i)];
        [v1 addObject:@(0)];
    }

    NSUInteger sourceCount = source.length;
    for (int i = 0; i < sourceCount; i++)
    {
        [v1 setObject:@(i + 1) atIndexedSubscript:0];

        NSUInteger targetCount = target.length;
        for (int j = 0; j < targetCount; j++)
        {
            NSUInteger cost = [source characterAtIndex:i] == [target characterAtIndex:j]? 0: dist[tolower([source characterAtIndex:i-1]) -'a'][tolower([target characterAtIndex:j])-'a'];
            NSInteger insertion = [[v1 objectAtIndex:j] integerValue] + insertCost;
            NSInteger deletion = [[v0 objectAtIndex:j + 1] integerValue] + delCost;
            NSInteger substitution = [[v0 objectAtIndex:j] integerValue] + cost;
            [v1 setObject:@(TMIN(insertion, deletion, substitution)) atIndexedSubscript:j + 1];
        }

        for (int j = 0; j < v0.count; j++)
        {
            [v0 setObject:[v1 objectAtIndex:j] atIndexedSubscript:j];
        }
    }

    return [v1[target.length] integerValue];
}

//https://en.wikipedia.org/wiki/Levenshtein_distance
+ (NSInteger)getLevenshteinDistanceFromSource:(NSString *)source toTarget:(NSString *)target {
    if ([source isEqualToString:target]) return 0;
    if (source.length == 0) return target.length;
    if (target.length == 0) return source.length;


    NSMutableArray *v0 = [NSMutableArray array];
    NSMutableArray *v1 = [NSMutableArray array];

    NSUInteger count = target.length + 1;
    for (int i = 0; i < count; i++)
    {
        [v0 addObject:@(i)];
        [v1 addObject:@(0)];
    }

    NSUInteger sourceCount = source.length;
    for (int i = 0; i < sourceCount; i++)
    {
        [v1 setObject:@(i + 1) atIndexedSubscript:0];

        NSUInteger targetCount = target.length;
        for (int j = 0; j < targetCount; j++)
        {
            NSUInteger cost = [source characterAtIndex:i] == [target characterAtIndex:j]? 0: 2;
            NSInteger insertion = [[v1 objectAtIndex:j] integerValue] + 1;
            NSInteger deletion = [[v0 objectAtIndex:j + 1] integerValue] + 1;
            NSInteger substitution = [[v0 objectAtIndex:j] integerValue] + cost;
            [v1 setObject:@(TMIN(insertion, deletion, substitution)) atIndexedSubscript:j + 1];
        }

        for (int j = 0; j < v0.count; j++)
        {
            [v0 setObject:[v1 objectAtIndex:j] atIndexedSubscript:j];
        }
    }

    return [v1[target.length] integerValue];
}

+ (NSArray *)matchElementsWithString:(NSString *)string  sourceElements:(NSArray *)sourceElements keyPath:(NSString *)keyPath{

    [sourceElements each:^(NSObject *object) {
        NSString *attrString = [object valueForKeyPath:keyPath];
        NSNumber *score = @([self getLevenshteinDistanceFromSource:string toTarget:attrString]);
        object.attachment = score;
    }];

    return [sourceElements sortedArrayUsingComparator:^NSComparisonResult(NSObject *obj1, NSObject *obj2) {
        if ([[obj1 valueForKeyPath:keyPath] containsString:string] && ![[obj2 valueForKeyPath:keyPath] containsString:string]) {
            return NSOrderedAscending;
        }
        else if (![[obj1 valueForKeyPath:keyPath] containsString:string] && [[obj2 valueForKeyPath:keyPath] containsString:string]) {
            return NSOrderedDescending;
        }
        else {
            return [obj1.attachment compare:obj2.attachment];
        }
    }];
}

@end
