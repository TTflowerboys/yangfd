//
//  NSArray+CUTECDN.h
//  currant
//
//  Created by Foster Yin on 6/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSArray (CUTECDN)

- (BOOL)containsCDNPath:(id)anObject;

- (NSUInteger)indexOfCDNPath:(id)anObject;

@end
