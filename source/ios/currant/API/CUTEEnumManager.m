//
//  CUTEEnumManager.m
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEEnumManager.h"
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import "CUTEEnum.h"
#import <BBTCommonMacro.h>

@interface CUTEEnumManager () {

    NSMutableDictionary *_enumCache;

    BBTRestClient *_backingManager;
}

@end

@implementation CUTEEnumManager

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
        _enumCache = [NSMutableDictionary dictionary];
        _backingManager = [BBTRestClient clientWithBaseURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]] account:nil];
    }
    return self;
}

- (void)getEnumsByType:(NSString *)type completion:(void (^)(NSArray *))block {
    if ([_enumCache objectForKey:type]) {
      if (block) {
        block([_enumCache objectForKey:type]);
      }
    }
    else {
      [_backingManager GET:@"/api/1/enum/search" parameters:@{@"type": type} resultClass:[CUTEEnum class] completion:^(AFHTTPRequestOperation *operation, id responseObject, NSError *error) {
          if (responseObject && [responseObject isKindOfClass:[NSArray class]] && !IsArrayNilOrEmpty(responseObject)) {
            [_enumCache setValue:responseObject forKey:type];
              if (block) {
                block(responseObject);
              }
          }
          else {
            if (block) {
              block(nil);
            }
          }
        }];
    }
}

- (void)startLoadAllEnums {
    [self getEnumsByType:@"country" completion:nil];
    [self getEnumsByType:@"city" completion:nil];
    [self getEnumsByType:@"property_type" completion:nil];
    [self getEnumsByType:@"deposit_option" completion:nil];
    [self getEnumsByType:@"indoor_facility" completion:nil];
    [self getEnumsByType:@"region_highlight" completion:nil];
    [self getEnumsByType:@"rent_type" completion:nil];
    [self getEnumsByType:@"rent_period" completion:nil];
    [self getEnumsByType:@"deposit_type" completion:nil];
}

- (NSArray *)enumsForType:(NSString *)type {
    //TODO sychroize for the cache not existed
    return [_enumCache objectForKey:type];
}

@end
