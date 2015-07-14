//
//  CUTEKeyboardStateListener.h
//  currant
//
//  Created by Foster Yin on 7/14/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface CUTEKeyboardStateListener : NSObject

+ (instancetype)sharedInstance;

@property (nonatomic, readonly, getter=isVisible) BOOL visible;


@end
