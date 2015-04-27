//
//  AssetsLibraryProvider.h
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AssetsLibrary/AssetsLibrary.h>

@interface AssetsLibraryProvider : NSObject

+ (instancetype)sharedInstance;

@property (nonatomic, readonly) ALAssetsLibrary *assetsLibrary;


@end
