//
//  CUTEKeyboardStateListener.m
//  currant
//
//  Created by Foster Yin on 7/14/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEKeyboardStateListener.h"
#import <UIKit/UIKit.h>

@interface CUTEKeyboardStateListener () {

    BOOL _isVisible;

}

@end

@implementation CUTEKeyboardStateListener


__strong static id sharedInstance = nil;

+ (void)load {
    static dispatch_once_t pred;
    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });
}

+ (instancetype)sharedInstance
{

    return sharedInstance;
}


- (instancetype)init
{
    self = [super init];
    if (self) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveKeyboardDidShow:) name:UIKeyboardDidShowNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveKeyboardDidHide:) name:UIKeyboardDidHideNotification object:nil];

    }
    return self;
}

- (BOOL)isVisible {
    return _isVisible;
}

- (void)onReceiveKeyboardDidShow:(NSNotification *)notif {
    _isVisible = YES;
}

- (void)onReceiveKeyboardDidHide:(NSNotification *)notif {
    _isVisible = NO;
}

@end
