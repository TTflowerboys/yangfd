//
//  CUTEUserEditingListener.h
//  currant
//
//  Created by Foster Yin on 6/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEModelEditingListener.h"
#import "CUTEUser.h"

@interface CUTEUserEditingListener : CUTEModelEditingListener

+ (CUTEUserEditingListener *)createListenerAndStartListenMarkWithSayer:(CUTEUser *)sayer;

@end
