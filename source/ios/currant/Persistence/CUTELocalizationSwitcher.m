//
//  CUTELocalizationSwitcher.m
//  currant
//
//  Created by Foster Yin on 9/16/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import "CUTELocalizationSwitcher.h"
#import "CUTEConfiguration.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTECommonMacro.h"

NSString *const CUTELocalizationDidUpdateNotification = @"CUTELocalizationDidUpdateNotification";

NSString * CurrantLocalizationFromSystem(NSString *systemLocalization){
    if ([systemLocalization hasPrefix:@"en"]) {
        return @"en_GB";
    }
    return @"zh_Hans_CN";
}

NSString * SystemLocalizationFromCurrant(NSString *localization){
    if ([localization isEqualToString:@"en_GB"]) {
        return @"en";
    }
    else if ([localization isEqualToString:@"zh_Hans_CN"]) {
        return @"zh-Hans";
    }
    return @"zh-Hans";
}

#define kLangCookieName @"currant_lang"

@interface CUTELocalizationSwitcher () {

    NSBundle *_localizationBundle;
}

@end


@implementation CUTELocalizationSwitcher

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
        [self restoreLocalizationCookie];
        [self updateLocalizationBundleWithLocalization:_currentLocalization];
    }
    return self;
}

- (void)persistLocalizationCookie {
    NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:[CUTEConfiguration hostURL]];
    for (NSHTTPCookie *cookie in cookies) {
        if ([cookie.name isEqualToString:kLangCookieName] && !IsNilNullOrEmpty(cookie.value)) {
            NSData *data = [NSKeyedArchiver archivedDataWithRootObject:cookie];
            [[NSUserDefaults standardUserDefaults] setObject:data forKey:kLangCookieName];
            [[NSUserDefaults standardUserDefaults] synchronize];
            break;
        }
    }
}


- (void)restoreLocalizationCookie {
    NSData *data = [[NSUserDefaults standardUserDefaults] objectForKey:kLangCookieName];
    if (data && data.length) {
        NSHTTPCookie *cookie = [NSKeyedUnarchiver unarchiveObjectWithData:data];
        if (cookie) {
            [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie];
            _currentLocalization = cookie.value;
        }
    }
}


- (NSArray *)localizations {
    return [[[NSBundle mainBundle] localizations] map:^id(NSString *object) {
        return CurrantLocalizationFromSystem(object);
    }];
}

- (void)setCurrentLocalization:(NSString *)currentLocalization {

    if (![_currentLocalization isEqualToString:currentLocalization]) {

        _currentLocalization = currentLocalization;
        [self updateLocalizationBundleWithLocalization:_currentLocalization];

        //set cookie to currant lang
        NSDictionary *properties = @{NSHTTPCookieName:kLangCookieName, NSHTTPCookieValue: currentLocalization, NSHTTPCookieDomain: [CUTEConfiguration host], NSHTTPCookiePath: @"/"};
        NSHTTPCookie *cookie = [[NSHTTPCookie alloc] initWithProperties:properties];
        [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie];
        [self persistLocalizationCookie];

        [[NSNotificationCenter defaultCenter] postNotificationName:CUTELocalizationDidUpdateNotification object:self];
    }
}

- (NSString *)currentSystemLocalization {

    //Available Country Code name can see here: http://www.ibabbleon.com/iOS-Language-Codes-ISO-639.html
    //Chinese(Simplified): zh-hans
    NSString *lang = CurrantLocalizationFromSystem([[[NSBundle mainBundle] preferredLocalizations] firstObject]);
    return lang;
}

- (NSString *)currentCookieLocalization {
    NSURL *url = [CUTEConfiguration hostURL];
    NSHTTPCookie *oldCookie = [[[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:url] find:^BOOL(NSHTTPCookie* object) {
        return [object.name isEqualToString:kLangCookieName];
    }];
    return oldCookie? oldCookie.value: nil;
}

- (void)updateLocalizationBundleWithLocalization:(NSString *)localization {
    NSString *systemLocalization = SystemLocalizationFromCurrant(localization);
    NSString *path = [[NSBundle mainBundle] pathForResource:systemLocalization ofType:@"lproj"];
    if (path == nil) {
        _localizationBundle = [NSBundle mainBundle];
    }
    else {
        _localizationBundle = [NSBundle bundleWithPath:path];
    }
}

- (NSString *)localizedStringForKey:(NSString *)key {
    return [_localizationBundle localizedStringForKey:key value:nil table:nil];
};

@end
