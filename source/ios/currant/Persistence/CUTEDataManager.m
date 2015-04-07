//
//  CUTEDataManager.m
//  currant
//
//  Created by Foster Yin on 3/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEDataManager.h"
#import "CUTEConfiguration.h"
#import "CUTEUserDefaultKey.h"
#import "CUTECommonMacro.h"
#import <NSArray+Frankenstein.h>

#define DomainKey(key) [NSString stringWithFormat:@"%@/%@", [CUTEConfiguration host], key]

@interface CUTEDataManager () {
    NSMutableArray *_rentTicketList;
}

@end


@implementation CUTEDataManager

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
        _rentTicketList = [NSMutableArray array];
    }
    return self;
}

- (BOOL)isUserLoggedIn {
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSArray *cookies = [storage cookiesForURL:[CUTEConfiguration hostURL]];
    BOOL isLoggedIn = NO;
    for (NSHTTPCookie *cookie in cookies) {
        if ([cookie.name isEqualToString:@"currant_auth"] && !IsNilNullOrEmpty(cookie.value)) {
            isLoggedIn = YES;
        }
    }
    return isLoggedIn;
}

- (void)saveAllCookies {
    NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:[CUTEConfiguration hostURL]];
    [self persistUserObject:cookies forKey:CUTE_USER_DEFAULT_COOKIES_KEY];
}

- (void)cleanAllCookies {
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
    for (NSHTTPCookie *cookie in cookies) {
        [storage deleteCookie:cookie];
    }
}

- (void)restoreAllCookies {
    NSArray *bplCookies = (NSArray *)[self getUserObjectForKey:CUTE_USER_DEFAULT_COOKIES_KEY];
    NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (NSHTTPCookie *cookie in bplCookies) {
        [cookieStorage setCookie:cookie];
       
    }
}

- (void)persistSystemObject:(NSObject *)object forKey:(NSString *)key
{
    NSData *data = [NSKeyedArchiver archivedDataWithRootObject:object];
    [[NSUserDefaults standardUserDefaults] setObject:data forKey:key];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (NSObject *)getSystemObjectForKey:(NSString *)key
{
    NSData *data = [[NSUserDefaults standardUserDefaults] objectForKey:key];
    if (data && [data length] > 0)
    {
        return [NSKeyedUnarchiver unarchiveObjectWithData:data];
    }
    return nil;
}

- (void)persistUserObject:(NSObject *)object forKey:(NSString *)key
{
    NSData *data = [NSKeyedArchiver archivedDataWithRootObject:object];
    [[NSUserDefaults standardUserDefaults] setObject:data forKey:DomainKey(key)];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (NSObject *)getUserObjectForKey:(NSString *)key
{
    NSData *data = [[NSUserDefaults standardUserDefaults] objectForKey:DomainKey(key)];
    if (data && [data length] > 0)
    {
        return [NSKeyedUnarchiver unarchiveObjectWithData:data];
    }
    return nil;
}

- (void)clearUserObjectForKey:(NSString *)key
{
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:DomainKey(key)];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

#pragma Rent Property

- (void)pushRentTicket:(CUTETicket *)ticket {
    [_rentTicketList pushObject:ticket];
}

- (CUTETicket *)popRentTicket {
    return [_rentTicketList popObject];
}

- (CUTETicket *)currentRentTicket {
    return [_rentTicketList lastObject];
}


@end
