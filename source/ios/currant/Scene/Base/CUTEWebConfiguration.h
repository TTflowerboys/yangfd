//
//  CUTEWebConfiguration.h
//  currant
//
//  Created by Foster Yin on 4/30/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "BBTWebBarButtonItem.h"

@interface CUTEWebConfiguration : NSObject

+ (instancetype)sharedInstance;

- (BOOL)isURLLoginRequired:(NSURL *)url;

- (NSURL *)getRedirectToLoginURLFromURL:(NSURL *)url;

- (BBTWebBarButtonItem *)getRightBarItemFromURL:(NSURL *)url;

- (BBTWebBarButtonItem *)getLeftBarItemFromURL:(NSURL *)url;

- (NSString *)getTitleFormURL:(NSURL *)url;

@end
