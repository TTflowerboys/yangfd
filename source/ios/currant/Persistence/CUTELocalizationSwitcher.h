//
//  CUTELocalizationSwitcher.h
//  currant
//
//  Created by Foster Yin on 9/16/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

extern NSString *const CUTELocalizationDidUpdateNotification;

@interface CUTELocalizationSwitcher : NSObject

+ (instancetype)sharedInstance;

@property (nonatomic, copy) NSString *currentLocalization;

@property (nonatomic, readonly) NSArray *localizations;

@property (nonatomic, readonly) NSString *currentCookieLocalization;

@property (nonatomic, readonly) NSString *currentSystemLocalization;

- (NSString*)localizedStringForKey:(NSString*)key;


@end
