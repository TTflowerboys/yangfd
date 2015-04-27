//
//  AssetsLibraryProvider.m
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "AssetsLibraryProvider.h"
#import <CTAssetsPickerController.h>

@interface AssetsLibraryProvider ()
{
    ALAssetsLibrary *_assetsLibrary;
}

@end


@implementation AssetsLibraryProvider

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;

    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
    });

    return sharedInstance;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        _assetsLibrary = [CTAssetsPickerController new].assetsLibrary;
    }
    return self;
}


@end
