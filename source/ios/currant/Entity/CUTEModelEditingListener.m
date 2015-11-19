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

typedef void (^ KeyValueChangeBlock) (NSString*, id, id);

@interface CUTEModelEditingListener ()
{
    NSMutableDictionary *_updateMarkDictionary;

    NSMutableSet *_deleteMarkSet;

    FBKVOController *_listenController;
}

@property (nonatomic, strong) MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *sayer;

@end

@implementation CUTEModelEditingListener

- (void)startListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {

    _updateMarkDictionary = [NSMutableDictionary dictionary];
    _deleteMarkSet = [NSMutableSet set];
    self.sayer = sayer;

    _listenController  = [FBKVOController controllerWithObserver:sayer];
    __weak typeof(self)weakSelf = self;

    [[[sayer class] propertyKeys] enumerateObjectsUsingBlock:^(NSString *obj, BOOL *stop) {
        [_listenController observe:sayer keyPath:obj options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld block:^(id observer, id object, NSDictionary *change) {
            [weakSelf markAttributeWithKey:obj oldValue:change[NSKeyValueChangeOldKey] newValue:change[NSKeyValueChangeNewKey]];
        }];
    }];
}

- (void)stopListenMark {
    [_listenController unobserveAll];
    _listenController = nil;
}

- (void)markAttributeWithKey:(NSString *)key oldValue:(id)oldValue newValue:(id)value {

    if (IsNilOrNull(oldValue) && !IsNilOrNull(value)) {
        [self markAttributeKeyUpdated:key withValue:value];
    }
    else if (!IsNilOrNull(oldValue) && IsNilOrNull(value)) {
        [self markAttributeKeyDeleted:key];
    }
    else if (!IsNilOrNull(oldValue) && !IsNilOrNull(value)) {
        if (![self.sayer isAttributeEqualForKey:key oldValue:oldValue newValue:value]) {
            [self markAttributeKeyUpdated:key withValue:value];
        }
    }
}

- (void)markAttributeKeyUpdated:(NSString *)propertyKey withValue:(id)value {
    id retValue = [self.sayer paramValueForKey:propertyKey withValue:value];
    id retKey = [[[self.sayer class] JSONKeyPathsByPropertyKey] objectForKey:propertyKey];
    NSAssert(retValue, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");
    NSAssert(retKey, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");
    [_updateMarkDictionary setObject:retValue forKey:retKey];
}

- (void)markAttributeKeyDeleted:(NSString *)propertyKey {
    id retKey = [[[self.sayer class] JSONKeyPathsByPropertyKey] objectForKey:propertyKey];
    NSAssert(retKey, @"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"");
    [_deleteMarkSet addObject:retKey];
}

- (NSDictionary *)getEditedParams {
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    [dic addEntriesFromDictionary:_updateMarkDictionary];

    if (!IsArrayNilOrEmpty([_deleteMarkSet allObjects])) {
        [dic setValue:[[_deleteMarkSet allObjects] componentsJoinedByString:@","] forKey:@"unset_fields"];
    }

    return dic;
}

@end
