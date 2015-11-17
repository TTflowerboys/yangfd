//
//  CUTEPropertyEditingListener.m
//  currant
//
//  Created by Foster Yin on 11/17/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTEPropertyEditingListener.h"
#import "CUTEProperty.h"
#import "CUTESurrounding.h"

@interface CUTEPropertyEditingListener () {

    NSArray *_surroundingsEditingListeners;

}

@end

@implementation CUTEPropertyEditingListener

//TODO refine the method structure
+ (CUTEPropertyEditingListener *)createListenerAndStartListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {
    CUTEPropertyEditingListener *listener = [CUTEPropertyEditingListener new];
    [listener startListenMarkWithSayer:sayer];
    return listener;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
    }
    return self;
}


- (void)startListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {
    [super startListenMarkWithSayer:sayer];
    CUTEProperty *property = (CUTEProperty *)sayer;
    NSMutableArray *surrroundingListeners = [NSMutableArray array];
    [property.surroundings enumerateObjectsUsingBlock:^(CUTESurrounding *  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        CUTEModelEditingListener *listener = [CUTEModelEditingListener new];
        [surrroundingListeners addObject:listener];
        [listener startListenMarkWithSayer:obj];
    }];

    _surroundingsEditingListeners = surrroundingListeners;
}

- (void)stopListenMark {
    [super stopListenMark];
    [_surroundingsEditingListeners enumerateObjectsUsingBlock:^(CUTEModelEditingListener*  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        [obj stopListenMark];
    }];
}

- (NSArray *)getEditedSurroundingsParams {
    __block BOOL hasChange  = NO;
    [_surroundingsEditingListeners enumerateObjectsUsingBlock:^(CUTEModelEditingListener*  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        NSDictionary *changedParams = [obj getEditedParams];
        if (changedParams && changedParams.count > 0) {
            hasChange = YES;
        }
    }];

    if (hasChange) {
        NSMutableArray *params = [NSMutableArray array];
        [_surroundingsEditingListeners enumerateObjectsUsingBlock:^(CUTEModelEditingListener*  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
            [params addObject:obj.sayer.toParams];
        }];
        return params;
    }
    
    return nil;
}

- (NSDictionary *)getEditedParams {
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:[super getEditedParams]];

    id surroundingsKey = [[[self.sayer class] JSONKeyPathsByPropertyKey] objectForKey:@"surroundings"];
    //添加和删除surrounding 会导致dic里面有这个key，只有编辑单个surrouding 不会有这个key
    if ([dic objectForKey:surroundingsKey] == nil) {
        NSArray * surroundings = [self getEditedSurroundingsParams];
        if (surroundings) {
            [dic setValue:surroundings forKey:surroundingsKey];
        }
    }


    return dic;
}

@end
