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
#import <YTKKeyValueStore.h>

#define DomainKey(key) [NSString stringWithFormat:@"%@/%@", [CUTEConfiguration host], key]

@interface CUTEDataManager () {

    YTKKeyValueStore *_store;
}

@end


@implementation CUTEDataManager

+ (instancetype)sharedInstance
{
    static dispatch_once_t pred;
    __strong static id sharedInstance = nil;
    
    dispatch_once(&pred, ^{
        sharedInstance = [[[self class] alloc] init];
        [sharedInstance setupStore];
        [sharedInstance restoreAllCookies];
        [sharedInstance restoreUser];

    });
    
    return sharedInstance;
}

#pragma mark - Tables

#define KTABLE_SETTINGS @"cute_settings"
#define KTABLE_UNFINISHE_RENT_TICKETS @"cute_unfinished_rent_tickets"

#pragma mark - Keys

#define KSETTING_AUTH_COOKIE @"currant_auth"
#define KSETTING_USER @"user"

- (void)setupStore {
    _store = [[YTKKeyValueStore alloc] initDBWithName:@"cute.db"];
    [_store createTableWithName:KTABLE_SETTINGS];
    [_store createTableWithName:KTABLE_UNFINISHE_RENT_TICKETS];
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
    for (NSHTTPCookie *cookie in cookies) {
        if ([cookie.name isEqualToString:KSETTING_AUTH_COOKIE] && !IsNilNullOrEmpty(cookie.value)) {
            [_store putString:cookie.value withId:KSETTING_AUTH_COOKIE intoTable:KTABLE_SETTINGS];
            break;
        }
    }
}

- (void)cleanAllCookies {
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
    for (NSHTTPCookie *cookie in cookies) {
        [storage deleteCookie:cookie];
    }
}

- (void)restoreAllCookies {
    NSString *cookieValue = (NSString *)[_store getStringById:KSETTING_AUTH_COOKIE fromTable:KTABLE_SETTINGS];
    if (cookieValue) {
        NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
        NSHTTPCookie *cookie = [[NSHTTPCookie alloc] initWithProperties:@{@"name":KSETTING_AUTH_COOKIE,
                                                                          @"value":cookieValue
                                                                          }];

        [cookieStorage setCookie:cookie];
    }
}


#pragma mark - User

- (void)restoreUser {
    YTKKeyValueItem *item = [_store getYTKKeyValueItemById:KSETTING_USER fromTable:KTABLE_SETTINGS];
    if (item && item.itemObject) {
        self.user = (CUTEUser *)[[[MTLJSONAdapter alloc] initWithJSONDictionary:item.itemObject modelClass:[CUTEUser class] error:nil] model];
    }
}

- (void)saveUser:(CUTEUser *)user {
    self.user = user;
    if (user) {
        [_store putObject:[MTLJSONAdapter JSONDictionaryFromModel:user] withId:KSETTING_USER intoTable:KTABLE_SETTINGS];
    }
    else {
        [self cleanUser];
    }
}

- (void)cleanUser {
    [_store deleteObjectById:KSETTING_USER fromTable:KTABLE_SETTINGS];
}

#pragma Rent Property

- (void)saveRentTicketToUnfinised:(CUTETicket *)ticket {
    [_store putObject:[MTLJSONAdapter JSONDictionaryFromModel:ticket] withId:ticket.identifier intoTable:KTABLE_UNFINISHE_RENT_TICKETS];
}

- (NSArray *)getAllUnfinishedRentTickets {
    return [[_store getAllItemsFromTable:KTABLE_UNFINISHE_RENT_TICKETS] map:^id(YTKKeyValueItem *object) {
        MTLJSONAdapter *ticket = [[MTLJSONAdapter alloc] initWithJSONDictionary:object.itemObject modelClass:[CUTETicket class] error:nil];
        return [ticket model];
    }];
}


@end
