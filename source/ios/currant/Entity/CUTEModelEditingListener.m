//
//  CUTEModelEditingListener.m
//  currant
//
//  Created by Foster Yin on 6/11/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEModelEditingListener.h"
#import <KVOController/FBKVOController.h>
#import <MTLJSONAdapter.h>
#import "CUTECommonMacro.h"

typedef void (^ KeyValueChangeBlock) (NSString*, id);

@interface CUTEModelEditingListener ()
{
    NSMutableDictionary *_updateMarkDictionary;

    NSMutableArray *_deleteMarkArray;

    FBKVOController *_listenController;
}

@property (nonatomic, weak) MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *sayer;

@end

@implementation CUTEModelEditingListener

+ (CUTEModelEditingListener *)createListenerAndStartListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {
    CUTEModelEditingListener *listener = [CUTEModelEditingListener new];
    [listener startListenMarkWithSayer:sayer];
    return listener;
}

- (void)startListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {

    _updateMarkDictionary = [NSMutableDictionary dictionary];
    _deleteMarkArray = [NSMutableArray array];
    self.sayer = sayer;

    _listenController  = [FBKVOController controllerWithObserver:sayer];
    __block KeyValueChangeBlock changeBlock = ^ (NSString *key, id value) {
        if (value && ![value isEqual:[NSNull null]]) {
            [self markPropertyKeyUpdated:key withValue:value];
        }
        else {
            [self markPropertyKeyDeleted:key];
        }
    };
    [[[sayer class] propertyKeys] enumerateObjectsUsingBlock:^(NSString *obj, BOOL *stop) {
        [_listenController observe:sayer keyPath:obj options:NSKeyValueObservingOptionNew block:^(id observer, id object, NSDictionary *change) {
            changeBlock(obj, change[NSKeyValueChangeNewKey]);
        }];
    }];
}

- (void)stopListenMark {
    [_listenController unobserveAll];
    _listenController = nil;
}

- (void)markPropertyKeyUpdated:(NSString *)propertyKey withValue:(id)value {
    id retValue = [self.sayer paramValueForKey:propertyKey withValue:value];
    id retKey = [[[self.sayer class] JSONKeyPathsByPropertyKey] objectForKey:propertyKey];
    if (!retValue) {

    }
    if (!retKey) {

    }
    [_updateMarkDictionary setObject:retValue forKey:retKey];
}

- (void)markPropertyKeyDeleted:(NSString *)propertyKey {
    [_deleteMarkArray addObject:[[[self.sayer class] JSONKeyPathsByPropertyKey] objectForKey:propertyKey]];
}

- (NSDictionary *)getEditedParams {
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    [dic addEntriesFromDictionary:_updateMarkDictionary];

    if (!IsArrayNilOrEmpty(_deleteMarkArray)) {
        [dic setValue:[_deleteMarkArray componentsJoinedByString:@","] forKey:@"unset_fields"];
    }

    return dic;
}

@end
