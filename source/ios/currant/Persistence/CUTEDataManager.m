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
    NSMutableArray *_rentTicketList;

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
    });
    
    return sharedInstance;
}

#pragma mark - Tables

#define KTABLE_SETTINGS @"cute_settings"
#define KTABLE_UNFINISHE_RENT_TICKETS @"cute_unfinished_rent_tickets"

#pragma mark - Keys

#define KSETTING_COOKIES @"cookies"

- (void)setupStore {
    _store = [[YTKKeyValueStore alloc] initDBWithName:@"cute.db"];
    [_store createTableWithName:KTABLE_SETTINGS];
    [_store createTableWithName:KTABLE_UNFINISHE_RENT_TICKETS];
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
    [_store putObject:cookies withId:KSETTING_COOKIES intoTable:KTABLE_SETTINGS];
}

- (void)cleanAllCookies {
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
    for (NSHTTPCookie *cookie in cookies) {
        [storage deleteCookie:cookie];
    }
}

- (void)restoreAllCookies {
    NSArray *bplCookies = (NSArray *)[_store getObjectById:KSETTING_COOKIES fromTable:KTABLE_SETTINGS];
    NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (NSHTTPCookie *cookie in bplCookies) {
        [cookieStorage setCookie:cookie];
    }
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
